import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  getAvailableSessions,
  getAllSessions,
  getMentorSessions,
  createSession,
  updateSession,
  cancelSession,
  completeSession,
  registerForSession,
  cancelRegistration,
  getEmployeeRegistrations,
  getSessionRegistrations,
  markAttendance,
  submitFeedback,
} from "../services/KnowledgeSessionService";

function KnowledgeSession() {
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

  // Database primary key
  // Example: 42
  const userId = localStorage.getItem("userId");

  // Business employee identifier
  // Example: EMP1001
  const employeeId = localStorage.getItem("employeeId");

  // =====================================================
  // STATE
  // =====================================================

  const [sessions, setSessions] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionRegistrations, setSessionRegistrations] = useState([]);

  const [showFeedback, setShowFeedback] = useState(false);

  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // FORM
  // =====================================================

  const emptyForm = {
    title: "",
    description: "",
    sessionDate: "",
    durationMinutes: 60,
    maxParticipants: 20,
    platform: "GOOGLE_MEET",
    meetingLink: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("========== KNOWLEDGE SESSION ==========");
      console.log("Role:", role);
      console.log("Database User ID:", userId);
      console.log("Employee ID:", employeeId);
      console.log("=======================================");

      // =================================================
      // EMPLOYEE
      // =================================================

      if (role === "EMPLOYEE") {
        if (!employeeId) {
          setError("Employee ID not found. Please login again.");
          return;
        }

        /*
         * IMPORTANT:
         *
         * DO NOT use getAvailableSessions() here.
         *
         * It returns only SCHEDULED sessions.
         *
         * We need COMPLETED and CANCELLED sessions too
         * so that employees can see completed sessions
         * and submit feedback.
         */

        const allSessions = await getAllSessions();

        console.log("ALL SESSIONS:", allSessions);

        setSessions(allSessions || []);

        // Employee registrations
        const employeeRegistrations =
          await getEmployeeRegistrations(employeeId);

        console.log(
          "EMPLOYEE REGISTRATIONS:",
          employeeRegistrations
        );

        setRegistrations(employeeRegistrations || []);

        return;
      }

      // =================================================
      // MENTOR
      // =================================================

      if (role === "MENTOR") {
        if (!userId) {
          setError("Mentor ID not found. Please login again.");
          return;
        }

        const mentorId = Number(userId);

        if (Number.isNaN(mentorId)) {
          console.error(
            "Invalid mentor database ID:",
            userId
          );

          setError(
            "Invalid mentor ID. Please login again."
          );

          return;
        }

        const mentorSessions =
          await getMentorSessions(mentorId);

        setSessions(mentorSessions || []);

        return;
      }

      // =================================================
      // OTHER ROLES
      // =================================================

      setSessions([]);
    } catch (err) {
      console.error(
        "Knowledge Session loading error:",
        err
      );

      console.error(
        "Response:",
        err.response?.data
      );

      console.error(
        "Status:",
        err.response?.status
      );

      setError(
        err.response?.data?.message ||
          "Failed to load knowledge sessions."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FORM INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // =====================================================
  // CREATE SESSION - MENTOR
  // =====================================================

  const handleCreateSession = async (e) => {
    e.preventDefault();

    if (role !== "MENTOR") {
      return;
    }

    try {
      setError("");
      setMessage("");

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

      await createSession(mentorId, {
        ...formData,
        durationMinutes: Number(
          formData.durationMinutes
        ),
        maxParticipants: Number(
          formData.maxParticipants
        ),
      });

      setMessage(
        "Knowledge session created successfully!"
      );

      setFormData(emptyForm);
      setShowCreateForm(false);

      await loadSessions();
    } catch (err) {
      console.error(
        "Create session error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to create session."
      );
    }
  };

  // =====================================================
  // EDIT SESSION - MENTOR
  // =====================================================

  const handleEdit = (session) => {
    if (role !== "MENTOR") {
      return;
    }

    if (session.status !== "SCHEDULED") {
      setError(
        "Only scheduled sessions can be edited."
      );
      return;
    }

    setEditingSession(session);

    setFormData({
      title: session.title || "",
      description: session.description || "",
      sessionDate: session.sessionDate
        ? session.sessionDate.slice(0, 16)
        : "",
      durationMinutes:
        session.durationMinutes || 60,
      maxParticipants:
        session.maxParticipants || 20,
      platform:
        session.platform || "GOOGLE_MEET",
      meetingLink:
        session.meetingLink || "",
    });
  };

  // =====================================================
  // UPDATE SESSION
  // =====================================================

  const handleUpdateSession = async (e) => {
    e.preventDefault();

    if (
      role !== "MENTOR" ||
      !editingSession
    ) {
      return;
    }

    if (editingSession.status !== "SCHEDULED") {
      setError(
        "Only scheduled sessions can be updated."
      );
      return;
    }

    try {
      setError("");
      setMessage("");

      await updateSession(
        editingSession.id,
        Number(userId),
        {
          ...formData,
          durationMinutes: Number(
            formData.durationMinutes
          ),
          maxParticipants: Number(
            formData.maxParticipants
          ),
        }
      );

      setMessage(
        "Knowledge session updated successfully!"
      );

      setEditingSession(null);
      setFormData(emptyForm);

      await loadSessions();
    } catch (err) {
      console.error(
        "Update session error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update session."
      );
    }
  };

  // =====================================================
  // CANCEL SESSION
  // =====================================================

  const handleCancelSession = async (sessionId) => {
    if (role !== "MENTOR") {
      return;
    }

    const session = sessions.find(
      (s) => s.id === sessionId
    );

    if (
      !session ||
      session.status !== "SCHEDULED"
    ) {
      setError(
        "Only scheduled sessions can be cancelled."
      );
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to cancel this session?"
      )
    ) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await cancelSession(
        sessionId,
        Number(userId)
      );

      setMessage(
        "Session cancelled successfully."
      );

      await loadSessions();
    } catch (err) {
      console.error(
        "Cancel session error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to cancel session."
      );
    }
  };

  // =====================================================
  // COMPLETE SESSION
  // =====================================================

  const handleCompleteSession = async (
    sessionId
  ) => {
    if (role !== "MENTOR") {
      return;
    }

    const session = sessions.find(
      (s) => s.id === sessionId
    );

    if (
      !session ||
      session.status !== "SCHEDULED"
    ) {
      setError(
        "Only scheduled sessions can be completed."
      );
      return;
    }

    try {
      setError("");
      setMessage("");

      await completeSession(
        sessionId,
        Number(userId)
      );

      setMessage(
        "Session completed successfully."
      );

      await loadSessions();
    } catch (err) {
      console.error(
        "Complete session error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to complete session."
      );
    }
  };

  // =====================================================
  // REGISTER - EMPLOYEE
  // =====================================================

  const handleRegister = async (sessionId) => {
    if (role !== "EMPLOYEE") {
      return;
    }

    try {
      setError("");
      setMessage("");

      if (!employeeId) {
        setError(
          "Employee ID not found. Please login again."
        );
        return;
      }

      await registerForSession(
        sessionId,
        employeeId
      );

      setMessage(
        "Successfully registered for the session!"
      );

      await loadSessions();
    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to register for session."
      );
    }
  };

  // =====================================================
  // CANCEL REGISTRATION
  // =====================================================

  const handleCancelRegistration = async (
    sessionId
  ) => {
    if (role !== "EMPLOYEE") {
      return;
    }

    try {
      setError("");
      setMessage("");

      if (!employeeId) {
        setError(
          "Employee ID not found. Please login again."
        );
        return;
      }

      await cancelRegistration(
        sessionId,
        employeeId
      );

      setMessage(
        "Registration cancelled successfully."
      );

      await loadSessions();
    } catch (err) {
      console.error(
        "Cancel registration error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to cancel registration."
      );
    }
  };

  // =====================================================
  // GET EMPLOYEE REGISTRATION
  // =====================================================

  const getRegistration = (sessionId) => {
    return registrations.find(
      (registration) =>
        registration.session?.id === sessionId ||
        registration.sessionId === sessionId
    );
  };

  // =====================================================
  // MENTOR - VIEW REGISTRATIONS
  // =====================================================

  const handleViewRegistrations = async (
    session
  ) => {
    if (role !== "MENTOR") {
      return;
    }

    if (session.status !== "SCHEDULED") {
      setError(
        "Registrations can only be viewed for scheduled sessions."
      );
      return;
    }

    try {
      setError("");

      const data =
        await getSessionRegistrations(
          session.id
        );

      setSessionRegistrations(data || []);
      setSelectedSession(session);
    } catch (err) {
      console.error(
        "Registration loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load registrations."
      );
    }
  };

  // =====================================================
  // MARK ATTENDANCE
  // =====================================================

  const handleAttendance = async (
    registrationId,
    attended
  ) => {
    if (role !== "MENTOR") {
      return;
    }

    try {
      setError("");
      setMessage("");

      await markAttendance(
        registrationId,
        attended
      );

      setMessage(
        "Attendance updated successfully."
      );

      if (selectedSession) {
        await handleViewRegistrations(
          selectedSession
        );
      }
    } catch (err) {
      console.error(
        "Attendance error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update attendance."
      );
    }
  };

  // =====================================================
  // OPEN FEEDBACK
  // =====================================================

  const openFeedback = (session) => {
    if (role !== "EMPLOYEE") {
      return;
    }

    const registration =
      getRegistration(session.id);

    if (!registration) {
      setError(
        "You are not registered for this session."
      );
      return;
    }

    if (session.status !== "COMPLETED") {
      setError(
        "Feedback is available only after session completion."
      );
      return;
    }

    if (!registration.attended) {
      setError(
        "Feedback is available only for attended sessions."
      );
      return;
    }

    setSelectedSession(session);
    setFeedbackRating(5);
    setFeedbackComments("");
    setShowFeedback(true);
  };

  // =====================================================
  // SUBMIT FEEDBACK
  // =====================================================

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (role !== "EMPLOYEE") {
      return;
    }

    try {
      setError("");
      setMessage("");

      if (!selectedSession) {
        setError(
          "No session selected."
        );
        return;
      }

      /*
       * IMPORTANT:
       *
       * Feedback backend expects numeric Employee.id.
       *
       * Registration APIs use EMP1001.
       *
       * Therefore use userId here.
       */

      if (!userId) {
        setError(
          "Employee database ID not found. Please login again."
        );
        return;
      }

      const numericEmployeeId =
        Number(userId);

      if (
        Number.isNaN(numericEmployeeId)
      ) {
        setError(
          "Invalid employee database ID."
        );
        return;
      }

      console.log(
        "Submitting feedback:",
        {
          sessionId: selectedSession.id,
          employeeId: numericEmployeeId,
          rating: feedbackRating,
          comments: feedbackComments,
        }
      );

      await submitFeedback(
        selectedSession.id,
        numericEmployeeId,
        feedbackRating,
        feedbackComments
      );

      setMessage(
        "Feedback submitted successfully!"
      );

      setShowFeedback(false);
      setSelectedSession(null);
      setFeedbackComments("");
      setFeedbackRating(5);
    } catch (err) {
      console.error(
        "Feedback error:",
        err
      );

      console.error(
        "Feedback response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to submit feedback."
      );
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
          <Navbar title="Knowledge Sessions" />

          <div className="p-8 text-center">
            Loading knowledge sessions...
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar role={role} />

      <div className="flex-1">
        <Navbar title="Knowledge Sessions" />

        <div className="p-8">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Knowledge Sessions
              </h2>

              <p className="text-gray-500 mt-1">
                {role === "MENTOR"
                  ? "Create and manage your knowledge-sharing sessions"
                  : "View and register for internal knowledge-sharing sessions"}
              </p>
            </div>

            {role === "MENTOR" && (
              <button
                onClick={() => {
                  setShowCreateForm(true);
                  setEditingSession(null);
                  setFormData(emptyForm);
                  setError("");
                  setMessage("");
                }}
                className="px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                + Create Session
              </button>
            )}
          </div>

          {/* MESSAGES */}

          {message && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* =================================================
              CREATE / EDIT FORM
          ================================================= */}

          {role === "MENTOR" &&
            (showCreateForm ||
              editingSession) && (
              <form
                onSubmit={
                  editingSession
                    ? handleUpdateSession
                    : handleCreateSession
                }
                className="bg-white rounded-xl shadow p-6 mb-8"
              >
                <h3 className="text-xl font-semibold mb-5">
                  {editingSession
                    ? "Edit Knowledge Session"
                    : "Create Knowledge Session"}
                </h3>

                <div className="grid md:grid-cols-2 gap-5">

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Session Title
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Advanced Spring Boot"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Date & Time
                    </label>

                    <input
                      type="datetime-local"
                      name="sessionDate"
                      value={formData.sessionDate}
                      onChange={handleChange}
                      required
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Duration (minutes)
                    </label>

                    <input
                      type="number"
                      name="durationMinutes"
                      value={formData.durationMinutes}
                      onChange={handleChange}
                      min="1"
                      required
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Maximum Participants
                    </label>

                    <input
                      type="number"
                      name="maxParticipants"
                      value={formData.maxParticipants}
                      onChange={handleChange}
                      min="1"
                      required
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Platform
                    </label>

                    <select
                      name="platform"
                      value={formData.platform}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="GOOGLE_MEET">
                        Google Meet
                      </option>

                      <option value="MICROSOFT_TEAMS">
                        Microsoft Teams
                      </option>

                      <option value="ZOOM">
                        Zoom
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Meeting Link
                    </label>

                    <input
                      type="url"
                      name="meetingLink"
                      value={formData.meetingLink}
                      onChange={handleChange}
                      required
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    required
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Describe what employees will learn..."
                  />
                </div>

                <div className="flex gap-3 mt-6">

                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {editingSession
                      ? "Update Session"
                      : "Create Session"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingSession(null);
                      setFormData(emptyForm);
                    }}
                    className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>

                </div>
              </form>
            )}

          {/* =================================================
              SESSION LIST
          ================================================= */}

          <div className="grid gap-6">

            {sessions.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                {role === "MENTOR"
                  ? "You have not created any knowledge sessions yet."
                  : "No knowledge sessions available."}
              </div>
            ) : (
              sessions.map((session) => {

                const registration =
                  role === "EMPLOYEE"
                    ? getRegistration(session.id)
                    : null;

                const isScheduled =
                  session.status === "SCHEDULED";

                const isCompleted =
                  session.status === "COMPLETED";

                const isCancelled =
                  session.status === "CANCELLED";

                const canGiveFeedback =
                  role === "EMPLOYEE" &&
                  isCompleted &&
                  registration &&
                  registration.attended === true;

                return (
                  <div
                    key={session.id}
                    className="bg-white rounded-xl shadow p-6"
                  >

                    {/* SESSION HEADER */}

                    <div className="flex justify-between">

                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {session.title}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          Expert:{" "}
                          {session.mentor?.firstName ||
                            ""}{" "}
                          {session.mentor?.lastName ||
                            ""}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 h-fit rounded-full text-sm ${
                          isScheduled
                            ? "bg-blue-100 text-blue-700"
                            : isCompleted
                            ? "bg-green-100 text-green-700"
                            : isCancelled
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>

                    {/* DESCRIPTION */}

                    <p className="text-gray-600 mt-4">
                      {session.description}
                    </p>

                    {/* DETAILS */}

                    <div className="grid md:grid-cols-4 gap-4 mt-5 text-sm">

                      <div>
                        <strong>Date:</strong>
                        <br />
                        {new Date(
                          session.sessionDate
                        ).toLocaleString()}
                      </div>

                      <div>
                        <strong>Duration:</strong>
                        <br />
                        {session.durationMinutes}{" "}
                        minutes
                      </div>

                      <div>
                        <strong>Platform:</strong>
                        <br />
                        {session.platform}
                      </div>

                      <div>
                        <strong>Participants:</strong>
                        <br />
                        {session.maxParticipants}
                      </div>

                    </div>

                    {/* =================================================
                        MENTOR ACTIONS
                    ================================================= */}

                    {role === "MENTOR" && (
                      <div className="flex flex-wrap gap-3 mt-6">

                        <button
                          onClick={() =>
                            handleEdit(session)
                          }
                          disabled={!isScheduled}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-400"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleCancelSession(
                              session.id
                            )
                          }
                          disabled={!isScheduled}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                        >
                          Cancel Session
                        </button>

                        <button
                          onClick={() =>
                            handleCompleteSession(
                              session.id
                            )
                          }
                          disabled={!isScheduled}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                        >
                          Complete
                        </button>

                        <button
                          onClick={() =>
                            handleViewRegistrations(
                              session
                            )
                          }
                          disabled={!isScheduled}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                        >
                          View Registrations
                        </button>

                      </div>
                    )}

                    {/* =================================================
                        EMPLOYEE ACTIONS
                    ================================================= */}

                    {role === "EMPLOYEE" && (
                      <div className="mt-6">

                        {/* NOT REGISTERED */}

                        {!registration &&
                          isScheduled && (
                            <button
                              onClick={() =>
                                handleRegister(
                                  session.id
                                )
                              }
                              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                              Register
                            </button>
                          )}

                        {/* CANCELLED SESSION */}

                        {!registration &&
                          isCancelled && (
                            <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg">
                              Session Cancelled
                            </span>
                          )}

                        {/* REGISTERED */}

                        {registration && (
                          <div className="flex flex-wrap gap-3 items-center">

                            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                              {registration.status}
                            </span>

                            {/* ATTENDANCE */}

                            {registration.attended === true && (
                              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
                                ✓ Attended
                              </span>
                            )}

                            {/* NOT ATTENDED */}

                            {isCompleted &&
                              registration.attended !==
                                true && (
                                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                                  Not Attended
                                </span>
                              )}

                            {/* CANCEL REGISTRATION */}

                            {registration.status ===
                              "REGISTERED" &&
                              isScheduled && (
                                <button
                                  onClick={() =>
                                    handleCancelRegistration(
                                      session.id
                                    )
                                  }
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                  Cancel Registration
                                </button>
                              )}

                            {/* =================================================
                                FEEDBACK BUTTON
                            ================================================= */}

                            {canGiveFeedback && (
                              <button
                                onClick={() =>
                                  openFeedback(
                                    session
                                  )
                                }
                                className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                              >
                                ⭐ Give Feedback
                              </button>
                            )}

                          </div>
                        )}

                        {/* COMPLETED BUT NO REGISTRATION */}

                        {isCompleted &&
                          !registration && (
                            <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                              Session Completed
                            </span>
                          )}

                      </div>
                    )}

                  </div>
                );
              })
            )}

          </div>
        </div>
      </div>

      {/* =====================================================
          MENTOR REGISTRATION MODAL
      ===================================================== */}

      {selectedSession &&
        role === "MENTOR" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">

              <div className="flex justify-between items-center">

                <h3 className="text-xl font-bold">
                  Registrations —{" "}
                  {selectedSession.title}
                </h3>

                <button
                  onClick={() => {
                    setSelectedSession(null);
                    setSessionRegistrations([]);
                  }}
                  className="text-gray-500 text-xl"
                >
                  ×
                </button>

              </div>

              <div className="mt-5">

                {sessionRegistrations.length === 0 ? (
                  <p className="text-gray-500">
                    No employees registered yet.
                  </p>
                ) : (
                  sessionRegistrations.map(
                    (registration) => (
                      <div
                        key={registration.id}
                        className="border rounded-lg p-4 mb-3 flex justify-between items-center"
                      >

                        <div>
                          <p className="font-semibold">
                            {
                              registration.employee
                                ?.firstName
                            }{" "}
                            {
                              registration.employee
                                ?.lastName
                            }
                          </p>

                          <p className="text-sm text-gray-500">
                            {
                              registration.employee
                                ?.employeeId
                            }
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            handleAttendance(
                              registration.id,
                              !registration.attended
                            )
                          }
                          className={`px-4 py-2 rounded-lg text-white ${
                            registration.attended
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {registration.attended
                            ? "Attended"
                            : "Mark Attendance"}
                        </button>

                      </div>
                    )
                  )
                )}

              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          EMPLOYEE FEEDBACK MODAL
      ===================================================== */}

      {showFeedback &&
        selectedSession &&
        role === "EMPLOYEE" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

            <form
              onSubmit={handleFeedbackSubmit}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >

              <h3 className="text-xl font-bold mb-2">
                Give Feedback
              </h3>

              <p className="text-gray-500 mb-5">
                {selectedSession.title}
              </p>

              {/* RATING */}

              <label className="block text-sm font-medium mb-2">
                Rating
              </label>

              <select
                value={feedbackRating}
                onChange={(e) =>
                  setFeedbackRating(
                    Number(e.target.value)
                  )
                }
                className="w-full border rounded-lg px-3 py-2 mb-4"
              >
                <option value="5">
                  5 - Excellent
                </option>

                <option value="4">
                  4 - Very Good
                </option>

                <option value="3">
                  3 - Good
                </option>

                <option value="2">
                  2 - Fair
                </option>

                <option value="1">
                  1 - Poor
                </option>
              </select>

              {/* COMMENTS */}

              <label className="block text-sm font-medium mb-2">
                Comments
              </label>

              <textarea
                value={feedbackComments}
                onChange={(e) =>
                  setFeedbackComments(
                    e.target.value
                  )
                }
                rows="4"
                required
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Share your feedback about the session..."
              />

              {/* BUTTONS */}

              <div className="flex gap-3 mt-5">

                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Submit Feedback
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowFeedback(false);
                    setSelectedSession(null);
                  }}
                  className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>

              </div>

            </form>
          </div>
        )}
    </div>
  );
}

export default KnowledgeSession;