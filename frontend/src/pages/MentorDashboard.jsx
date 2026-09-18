import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  User,
  Mail,
  BookOpen,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

import api from "../services/api";

// =========================================================
// MENTOR DASHBOARD
// =========================================================

function MentorDashboard() {
  // =========================================================
  // MENTOR INFORMATION
  // =========================================================

  const firstName =
    localStorage.getItem("firstName") || "";

  const lastName =
    localStorage.getItem("lastName") || "";

  const employeeId =
    localStorage.getItem("employeeId") || "";

  const fullName = [
    firstName,
    lastName,
  ]
    .filter(Boolean)
    .join(" ");

  // =========================================================
  // STATE
  // =========================================================

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] =
    useState(null);

  // =========================================================
  // LOAD MENTORSHIP REQUESTS
  // =========================================================

  useEffect(() => {
    loadMentorshipRequests();
  }, []);

  const loadMentorshipRequests = async () => {
    try {
      setLoading(true);
      setError("");

      if (!employeeId) {
        setError(
          "Mentor ID not found. Please login again."
        );
        return;
      }

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError(
          "Your session has expired. Please login again."
        );
        return;
      }

      const response = await api.get(
        `/mentorships/mentor/${employeeId}`
      );

      console.log(
        "Mentor mentorships:",
        response.data
      );

      setRequests(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load mentorship requests:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to access mentor requests."
        );
        return;
      }

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to load mentorship requests."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // ACCEPT REQUEST
  // =========================================================

  const handleAccept = async (
    mentorshipId
  ) => {
    try {
      setProcessingId(mentorshipId);

      await api.put(
        `/mentorships/${mentorshipId}/accept`,
        {}
      );

      // Reload data from database
      await loadMentorshipRequests();
    } catch (err) {
      console.error(
        "Accept mentorship error:",
        err
      );

      alert(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to accept mentorship request."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================================
  // REJECT REQUEST
  // =========================================================

  const handleReject = async (
    mentorshipId
  ) => {
    try {
      setProcessingId(mentorshipId);

      await api.put(
        `/mentorships/${mentorshipId}/reject`,
        {}
      );

      // Reload data from database
      await loadMentorshipRequests();
    } catch (err) {
      console.error(
        "Reject mentorship error:",
        err
      );

      alert(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to reject mentorship request."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================================
  // ACTIVATE ACCEPTED MENTORSHIP
  // =========================================================

  const handleActivate = async (
    mentorshipId
  ) => {
    try {
      setProcessingId(mentorshipId);

      await api.put(
        `/mentorships/${mentorshipId}/activate`,
        {}
      );

      // Reload database data
      await loadMentorshipRequests();
    } catch (err) {
      console.error(
        "Activate mentorship error:",
        err
      );

      alert(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to activate mentorship."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================================
  // COMPLETE ACTIVE MENTORSHIP
  // =========================================================

  const handleComplete = async (
    mentorshipId
  ) => {
    try {
      setProcessingId(mentorshipId);

      await api.put(
        `/mentorships/${mentorshipId}/complete`,
        {}
      );

      // Reload database data
      await loadMentorshipRequests();
    } catch (err) {
      console.error(
        "Complete mentorship error:",
        err
      );

      alert(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to complete mentorship."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================================
  // HELPER FUNCTIONS
  // =========================================================

  // The backend may return skill information directly
  // as mentorship.skillName, or nested as mentorship.skill.skillName.

  const getSkillName = (
    mentorship
  ) => {
    return (
      mentorship?.skillName ||
      mentorship?.skill?.skillName ||
      "Skill not specified"
    );
  };

  const getMenteeFirstName = (
    mentorship
  ) => {
    return (
      mentorship?.mentee?.firstName ||
      mentorship?.menteeFirstName ||
      ""
    );
  };

  const getMenteeLastName = (
    mentorship
  ) => {
    return (
      mentorship?.mentee?.lastName ||
      mentorship?.menteeLastName ||
      ""
    );
  };

  const getMenteeDesignation = (
    mentorship
  ) => {
    return (
      mentorship?.mentee?.designation ||
      mentorship?.menteeDesignation ||
      "Employee"
    );
  };

  const getMenteeEmployeeId = (
    mentorship
  ) => {
    return (
      mentorship?.mentee?.employeeId ||
      mentorship?.menteeEmployeeId ||
      ""
    );
  };

  const getMenteeEmail = (
    mentorship
  ) => {
    return (
      mentorship?.mentee?.email ||
      mentorship?.menteeEmail ||
      ""
    );
  };

  const getMenteeInitials = (
    mentorship
  ) => {
    const first =
      getMenteeFirstName(
        mentorship
      );

    const last =
      getMenteeLastName(
        mentorship
      );

    return (
      `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`
        .toUpperCase() ||
      "E"
    );
  };

  // =========================================================
  // PENDING REQUESTS
  // =========================================================

  const pendingRequests =
    requests.filter(
      (request) =>
        request.status?.toUpperCase() ===
        "REQUESTED"
    );

  // =========================================================
  // ACCEPTED MENTORSHIPS
  // =========================================================

  const acceptedMentorships =
    requests.filter(
      (request) =>
        request.status?.toUpperCase() ===
        "ACCEPTED"
    );

  // =========================================================
  // ACTIVE MENTORSHIPS
  // =========================================================

  const activeMentorships =
    requests.filter(
      (request) =>
        request.status?.toUpperCase() ===
        "ACTIVE"
    );

  // =========================================================
  // REJECTED MENTORSHIPS
  // =========================================================

  const rejectedMentorships =
    requests.filter(
      (request) =>
        request.status?.toUpperCase() ===
        "REJECTED"
    );

  // =========================================================
  // COMPLETED MENTORSHIPS
  // =========================================================

  const completedMentorships =
    requests.filter(
      (request) =>
        request.status?.toUpperCase() ===
        "COMPLETED"
    );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen">

        <Sidebar role="MENTOR" />

        <div className="flex-1">

          <Navbar title="Mentor Dashboard" />

          <main className="p-8">

            <div className="rounded-xl bg-white p-8 shadow">

              <p className="text-gray-600">
                Loading mentorship requests...
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

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar role="MENTOR" />

      <div className="flex-1">

        {/* ===================================================
            NAVBAR
        =================================================== */}

        <Navbar title="Mentor Dashboard" />

        <main className="p-8">

          {/* =================================================
              WELCOME
          ================================================= */}

          <div className="mb-8">

            <h1 className="text-3xl font-bold text-slate-800">
              Mentor Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Welcome{" "}
              <span className="font-semibold text-slate-800">
                {fullName || "Mentor"}
              </span>
              . View and manage mentorship requests
              from employees.
            </p>

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
              STATISTICS
          ================================================= */}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

            {/* PENDING */}

            <div className="rounded-xl bg-white p-6 shadow">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-gray-500">
                    Pending Requests
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-yellow-600">
                    {pendingRequests.length}
                  </h2>

                </div>

                <Clock
                  size={42}
                  className="text-yellow-500"
                />

              </div>

            </div>

            {/* ACCEPTED */}

            <div className="rounded-xl bg-white p-6 shadow">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-gray-500">
                    Accepted Mentorships
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-blue-600">
                    {acceptedMentorships.length}
                  </h2>

                </div>

                <CheckCircle
                  size={42}
                  className="text-blue-500"
                />

              </div>

            </div>

            {/* ACTIVE */}

            <div className="rounded-xl bg-white p-6 shadow">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-gray-500">
                    Active Mentorships
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-green-600">
                    {activeMentorships.length}
                  </h2>

                </div>

                <User
                  size={42}
                  className="text-green-500"
                />

              </div>

            </div>

          </div>

          {/* =================================================
              INCOMING MENTORSHIP REQUESTS
          ================================================= */}

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">

            <div className="mb-6">

              <h2 className="text-2xl font-bold text-slate-800">
                Incoming Mentorship Requests
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Review mentorship requests sent by employees.
              </p>

            </div>

            {/* NO REQUESTS */}

            {pendingRequests.length === 0 ? (

              <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">

                <Clock
                  size={48}
                  className="mx-auto text-gray-400"
                />

                <h3 className="mt-4 text-lg font-semibold text-gray-700">
                  No Pending Requests
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  New mentorship requests will appear here.
                </p>

              </div>

            ) : (

              <div className="space-y-5">

                {pendingRequests.map(
                  (mentorship) => {

                    const menteeFirstName =
                      getMenteeFirstName(
                        mentorship
                      );

                    const menteeLastName =
                      getMenteeLastName(
                        mentorship
                      );

                    const skillName =
                      getSkillName(
                        mentorship
                      );

                    return (
                      <div
                        key={
                          mentorship.id
                        }
                        className="rounded-xl border border-yellow-200 bg-yellow-50/40 p-6"
                      >

                        {/* EMPLOYEE INFORMATION */}

                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                          <div className="flex items-start gap-4">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                              {getMenteeInitials(
                                mentorship
                              )}
                            </div>

                            <div>

                              <h3 className="text-xl font-semibold text-slate-800">
                                {menteeFirstName}{" "}
                                {menteeLastName}
                              </h3>

                              <p className="mt-1 text-sm text-gray-500">
                                {getMenteeDesignation(
                                  mentorship
                                )}
                              </p>

                              <p className="mt-2 text-sm text-gray-500">
                                Employee ID:{" "}
                                <span className="font-medium text-gray-700">
                                  {getMenteeEmployeeId(
                                    mentorship
                                  )}
                                </span>
                              </p>

                            </div>

                          </div>

                          {/* STATUS */}

                          <span className="self-start rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700">
                            REQUESTED
                          </span>

                        </div>

                        {/* REQUEST DETAILS */}

                        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

                          {/* SKILL */}

                          <div className="rounded-xl bg-white p-5">

                            <div className="flex items-center gap-2">

                              <BookOpen
                                size={20}
                                className="text-indigo-600"
                              />

                              <p className="text-sm font-medium text-indigo-600">
                                Skill Requested
                              </p>

                            </div>

                            <p className="mt-2 text-lg font-semibold text-slate-800">
                              {skillName}
                            </p>

                          </div>

                          {/* REQUEST DATE */}

                          <div className="rounded-xl bg-white p-5">

                            <p className="text-sm font-medium text-gray-500">
                              Request Date
                            </p>

                            <p className="mt-2 text-lg font-semibold text-slate-800">
                              {mentorship.startDate ||
                                "Not available"}
                            </p>

                          </div>

                        </div>

                        {/* GOAL */}

                        {mentorship.goal && (
                          <div className="mt-5 rounded-xl bg-white p-5">

                            <p className="text-sm font-medium text-gray-500">
                              Mentorship Goal
                            </p>

                            <p className="mt-2 leading-relaxed text-gray-700">
                              {mentorship.goal}
                            </p>

                          </div>
                        )}

                        {/* EMAIL */}

                        {getMenteeEmail(
                          mentorship
                        ) && (
                          <div className="mt-5 flex items-center gap-2 text-sm text-gray-600">

                            <Mail size={16} />

                            <span>
                              {getMenteeEmail(
                                mentorship
                              )}
                            </span>

                          </div>
                        )}

                        {/* ACTION BUTTONS */}

                        <div className="mt-6 flex flex-wrap gap-3">

                          {/* ACCEPT */}

                          <button
                            onClick={() =>
                              handleAccept(
                                mentorship.id
                              )
                            }
                            disabled={
                              processingId ===
                              mentorship.id
                            }
                            className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <CheckCircle size={18} />

                            {processingId ===
                            mentorship.id
                              ? "Processing..."
                              : "Accept"}

                          </button>

                          {/* REJECT */}

                          <button
                            onClick={() =>
                              handleReject(
                                mentorship.id
                              )
                            }
                            disabled={
                              processingId ===
                              mentorship.id
                            }
                            className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <XCircle size={18} />

                            {processingId ===
                            mentorship.id
                              ? "Processing..."
                              : "Reject"}

                          </button>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>

          {/* =================================================
              ACCEPTED MENTORSHIPS
          ================================================= */}

          {acceptedMentorships.length > 0 && (
            <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">

              <div className="mb-6">

                <h2 className="text-2xl font-bold text-slate-800">
                  Accepted Mentorships
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Accepted requests that are ready to be activated.
                </p>

              </div>

              <div className="space-y-5">

                {acceptedMentorships.map(
                  (mentorship) => {

                    const menteeFirstName =
                      getMenteeFirstName(
                        mentorship
                      );

                    const menteeLastName =
                      getMenteeLastName(
                        mentorship
                      );

                    return (
                      <div
                        key={
                          mentorship.id
                        }
                        className="rounded-xl border border-blue-200 bg-blue-50/40 p-6"
                      >

                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                          <div>

                            <h3 className="text-xl font-semibold text-slate-800">
                              {menteeFirstName}{" "}
                              {menteeLastName}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              {getMenteeDesignation(
                                mentorship
                              )}
                            </p>

                            <p className="mt-3 text-sm text-gray-600">
                              Skill:{" "}
                              <span className="font-semibold">
                                {getSkillName(
                                  mentorship
                                )}
                              </span>
                            </p>

                          </div>

                          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                            ACCEPTED
                          </span>

                        </div>

                        {mentorship.goal && (
                          <div className="mt-5 rounded-xl bg-white p-4">

                            <p className="text-sm font-medium text-gray-500">
                              Goal
                            </p>

                            <p className="mt-2 text-gray-700">
                              {mentorship.goal}
                            </p>

                          </div>
                        )}

                        {/* ACTIVATE */}

                        <button
                          onClick={() =>
                            handleActivate(
                              mentorship.id
                            )
                          }
                          disabled={
                            processingId ===
                            mentorship.id
                          }
                          className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {processingId ===
                          mentorship.id
                            ? "Activating..."
                            : "Activate Mentorship"}
                        </button>

                      </div>
                    );
                  }
                )}

              </div>

            </div>
          )}

          {/* =================================================
              ACTIVE MENTORSHIPS
          ================================================= */}

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">

            <div className="mb-6">

              <h2 className="text-2xl font-bold text-slate-800">
                Active Mentorships
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Mentorships that are currently active with employees.
              </p>

            </div>

            {activeMentorships.length === 0 ? (

              <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">

                <User
                  size={48}
                  className="mx-auto text-gray-400"
                />

                <h3 className="mt-4 text-lg font-semibold text-gray-700">
                  No Active Mentorships
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Accepted and activated mentorships will appear here.
                </p>

              </div>

            ) : (

              <div className="space-y-5">

                {activeMentorships.map(
                  (mentorship) => {

                    const menteeFirstName =
                      getMenteeFirstName(
                        mentorship
                      );

                    const menteeLastName =
                      getMenteeLastName(
                        mentorship
                      );

                    return (
                      <div
                        key={
                          mentorship.id
                        }
                        className="rounded-xl border border-green-200 bg-green-50/40 p-6 transition hover:shadow-md"
                      >

                        {/* EMPLOYEE */}

                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                          <div className="flex items-start gap-4">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-700">
                              {getMenteeInitials(
                                mentorship
                              )}
                            </div>

                            <div>

                              <h3 className="text-xl font-semibold text-slate-800">
                                {menteeFirstName}{" "}
                                {menteeLastName}
                              </h3>

                              <p className="mt-1 text-sm text-gray-500">
                                {getMenteeDesignation(
                                  mentorship
                                )}
                              </p>

                              <p className="mt-2 text-sm text-gray-500">
                                Employee ID:{" "}
                                <span className="font-medium text-gray-700">
                                  {getMenteeEmployeeId(
                                    mentorship
                                  )}
                                </span>
                              </p>

                            </div>

                          </div>

                          {/* STATUS */}

                          <span className="self-start rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                            ACTIVE
                          </span>

                        </div>

                        {/* SKILL + START DATE */}

                        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

                          {/* SKILL */}

                          <div className="rounded-xl bg-white p-5">

                            <div className="flex items-center gap-2">

                              <BookOpen
                                size={20}
                                className="text-blue-600"
                              />

                              <p className="text-sm font-medium text-blue-600">
                                Skill Being Mentored
                              </p>

                            </div>

                            <p className="mt-2 text-lg font-semibold text-slate-800">
                              {getSkillName(
                                mentorship
                              )}
                            </p>

                          </div>

                          {/* START DATE */}

                          <div className="rounded-xl bg-white p-5">

                            <p className="text-sm font-medium text-gray-500">
                              Mentorship Start Date
                            </p>

                            <p className="mt-2 text-lg font-semibold text-slate-800">
                              {mentorship.startDate ||
                                "Not available"}
                            </p>

                          </div>

                        </div>

                        {/* GOAL */}

                        {mentorship.goal && (
                          <div className="mt-5 rounded-xl bg-white p-5">

                            <p className="text-sm font-medium text-gray-500">
                              Mentorship Goal
                            </p>

                            <p className="mt-2 leading-relaxed text-gray-700">
                              {mentorship.goal}
                            </p>

                          </div>
                        )}

                        {/* EMAIL */}

                        {getMenteeEmail(
                          mentorship
                        ) && (
                          <div className="mt-5 flex items-center gap-2 text-sm text-gray-600">

                            <Mail size={16} />

                            <span>
                              {getMenteeEmail(
                                mentorship
                              )}
                            </span>

                          </div>
                        )}

                        {/* COMPLETE */}

                        <button
                          onClick={() =>
                            handleComplete(
                              mentorship.id
                            )
                          }
                          disabled={
                            processingId ===
                            mentorship.id
                          }
                          className="mt-5 rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {processingId ===
                          mentorship.id
                            ? "Completing..."
                            : "Complete Mentorship"}
                        </button>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </div>

          {/* =================================================
              COMPLETED MENTORSHIPS
          ================================================= */}

          {completedMentorships.length > 0 && (
            <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">

              <div className="mb-6">

                <h2 className="text-2xl font-bold text-slate-800">
                  Completed Mentorships
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Mentorships that have been completed.
                </p>

              </div>

              <div className="space-y-4">

                {completedMentorships.map(
                  (mentorship) => {

                    const menteeFirstName =
                      getMenteeFirstName(
                        mentorship
                      );

                    const menteeLastName =
                      getMenteeLastName(
                        mentorship
                      );

                    return (
                      <div
                        key={
                          mentorship.id
                        }
                        className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                      >

                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                          <div>

                            <h3 className="font-semibold text-slate-800">
                              {menteeFirstName}{" "}
                              {menteeLastName}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              Skill:{" "}
                              <span className="font-medium">
                                {getSkillName(
                                  mentorship
                                )}
                              </span>
                            </p>

                          </div>

                          <span className="rounded-full bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-600">
                            COMPLETED
                          </span>

                        </div>

                        {mentorship.endDate && (
                          <p className="mt-3 text-sm text-gray-500">
                            Completed on:{" "}
                            {mentorship.endDate}
                          </p>
                        )}

                      </div>
                    );
                  }
                )}

              </div>

            </div>
          )}

        </main>

      </div>
    </div>
  );
}

export default MentorDashboard;