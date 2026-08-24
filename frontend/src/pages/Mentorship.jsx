import React, { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const API_BASE_URL = "http://localhost:8080/api";

const levelNames = {
  1: "Beginner",
  2: "Intermediate",
  3: "Competent",
  4: "Advanced",
  5: "Expert",
};

const levelColors = {
  1: "bg-red-100 text-red-700",
  2: "bg-orange-100 text-orange-700",
  3: "bg-yellow-100 text-yellow-700",
  4: "bg-blue-100 text-blue-700",
  5: "bg-green-100 text-green-700",
};

function Mentorship() {
  // =========================================================
  // STATE
  // =========================================================

  const [recommendations, setRecommendations] = useState([]);
  const [mentorships, setMentorships] = useState([]);

  const [loading, setLoading] = useState(false);
  const [mentorshipLoading, setMentorshipLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const [selectedMentor, setSelectedMentor] = useState(null);

  const [goal, setGoal] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // LOGGED-IN EMPLOYEE
  // =========================================================

  const employeeId = localStorage.getItem("employeeId");

  // =========================================================
  // AXIOS HEADERS
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
  // LOAD RECOMMENDED MENTORS
  // =========================================================

  const loadRecommendations = async () => {
    if (!employeeId) {
      setError("Employee ID not found. Please login again.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_BASE_URL}/mentorships/recommendations/${employeeId}`,
        getHeaders()
      );

      console.log("Mentor recommendations:", response.data);

      setRecommendations(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error(
        "Failed to load mentor recommendations:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to load mentor recommendations."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD MY MENTORSHIPS
  // =========================================================

  const loadMentorships = async () => {
    if (!employeeId) {
      return;
    }

    try {
      setMentorshipLoading(true);

      const response = await axios.get(
        `${API_BASE_URL}/mentorships/employee/${employeeId}`,
        getHeaders()
      );

      console.log("My mentorships:", response.data);

      setMentorships(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error(
        "Failed to load mentorships:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Unable to load your mentorships."
      );
    } finally {
      setMentorshipLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadRecommendations();
    loadMentorships();
  }, []);

  // =========================================================
  // OPEN REQUEST FORM
  // =========================================================

  const openRequestForm = (mentor) => {
    console.log("Selected mentor:", mentor);

    if (!mentor.skillId) {
      setError(
        `Skill ID is missing for ${mentor.firstName || ""} ${
          mentor.lastName || ""
        }.`
      );
      return;
    }

    setSelectedMentor(mentor);
    setGoal("");
    setMessage("");
    setError("");
  };

  // =========================================================
  // CLOSE REQUEST FORM
  // =========================================================

  const closeRequestForm = () => {
    if (requesting) {
      return;
    }

    setSelectedMentor(null);
    setGoal("");
    setMessage("");
    setError("");
  };

  // =========================================================
  // SEND MENTORSHIP REQUEST
  // =========================================================

  const sendMentorshipRequest = async () => {
    if (!selectedMentor) {
      return;
    }

    // -------------------------------------------------------
    // Employee ID
    // -------------------------------------------------------

    if (!employeeId) {
      setError(
        "Employee ID not found. Please login again."
      );
      return;
    }

    // -------------------------------------------------------
    // Goal
    // -------------------------------------------------------

    if (!goal.trim()) {
      setError(
        "Please enter your mentorship goal."
      );
      return;
    }

    // -------------------------------------------------------
    // Mentor ID
    // -------------------------------------------------------

    if (!selectedMentor.employeeId) {
      setError(
        "Mentor employee ID is missing. Please refresh the page."
      );
      return;
    }

    // -------------------------------------------------------
    // Skill ID
    // -------------------------------------------------------

    if (!selectedMentor.skillId) {
      setError(
        "Skill information is missing for this mentor. Please refresh the page."
      );
      return;
    }

    try {
      setRequesting(true);
      setError("");
      setMessage("");

      const params = new URLSearchParams();

      params.append(
        "menteeIdentifier",
        employeeId
      );

      params.append(
        "mentorIdentifier",
        selectedMentor.employeeId
      );

      // Important:
      // This prevents mentorship.skill_id from being NULL.
      params.append(
        "skillId",
        String(selectedMentor.skillId)
      );

      params.append(
        "goal",
        goal.trim()
      );

      console.log(
        "Sending mentorship request:",
        {
          menteeIdentifier: employeeId,
          mentorIdentifier:
            selectedMentor.employeeId,
          skillId:
            selectedMentor.skillId,
          skillName:
            selectedMentor.skillName,
          goal: goal.trim(),
        }
      );

      const response = await axios.post(
        `${API_BASE_URL}/mentorships?${params.toString()}`,
        null,
        getHeaders()
      );

      console.log(
        "Mentorship created:",
        response.data
      );

      setMessage(
        `Mentorship request sent successfully to ${
          selectedMentor.firstName || ""
        } ${selectedMentor.lastName || ""}.`
      );

      setSelectedMentor(null);
      setGoal("");

      await loadMentorships();
    } catch (err) {
      console.error(
        "Failed to send mentorship request:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to send mentorship request."
      );
    } finally {
      setRequesting(false);
    }
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "REQUESTED":
        return "bg-yellow-100 text-yellow-700";

      case "ACCEPTED":
        return "bg-blue-100 text-blue-700";

      case "ACTIVE":
        return "bg-green-100 text-green-700";

      case "COMPLETED":
        return "bg-purple-100 text-purple-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "CANCELLED":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =========================================================
  // LEVEL NAME
  // =========================================================

  const getLevelName = (level) => {
    return (
      levelNames[level] ||
      `Level ${level || 0}`
    );
  };

  // =========================================================
  // LEVEL COLOR
  // =========================================================

  const getLevelColor = (level) => {
    return (
      levelColors[level] ||
      "bg-gray-100 text-gray-700"
    );
  };

  // =========================================================
  // FILTER MENTORSHIPS
  // =========================================================

  const requestedMentorships =
    mentorships.filter(
      (item) =>
        item.status?.toUpperCase() ===
        "REQUESTED"
    );

  const acceptedMentorships =
    mentorships.filter(
      (item) =>
        item.status?.toUpperCase() ===
        "ACCEPTED"
    );

  const activeMentorships =
    mentorships.filter(
      (item) =>
        item.status?.toUpperCase() ===
        "ACTIVE"
    );

  const rejectedMentorships =
    mentorships.filter(
      (item) =>
        item.status?.toUpperCase() ===
        "REJECTED"
    );

  const completedMentorships =
    mentorships.filter(
      (item) =>
        item.status?.toUpperCase() ===
        "COMPLETED"
    );

  // =========================================================
  // MENTORSHIP CARD
  // =========================================================

  const MentorshipCard = ({ mentorship }) => {
    const mentor = mentorship.mentor;
    const skill = mentorship.skill;

    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        {/* MENTOR HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              {mentor?.firstName?.charAt(0) || ""}
              {mentor?.lastName?.charAt(0) || ""}
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">
                {mentor?.firstName || ""}{" "}
                {mentor?.lastName || ""}
              </h3>

              <p className="text-sm text-gray-500">
                {mentor?.designation ||
                  "Mentor"}
              </p>
            </div>
          </div>

          {/* STATUS */}

          <span
            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
              mentorship.status
            )}`}
          >
            {mentorship.status}
          </span>
        </div>

        {/* DETAILS */}

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-xs text-blue-600">
              Skill
            </p>

            <p className="mt-1 font-semibold text-gray-800">
              {skill?.skillName ||
                "Not specified"}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">
              Request Date
            </p>

            <p className="mt-1 font-semibold text-gray-800">
              {mentorship.startDate ||
                mentorship.createdAt ||
                "Not available"}
            </p>
          </div>
        </div>

        {/* GOAL */}

        {mentorship.goal && (
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-500">
              Mentorship Goal
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {mentorship.goal}
            </p>
          </div>
        )}
      </div>
    );
  };

  // =========================================================
  // EMPTY STATE
  // =========================================================

  const EmptyState = ({ message }) => (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
      <p className="text-sm text-gray-500">
        {message}
      </p>
    </div>
  );

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* =====================================================
          EMPLOYEE SIDEBAR
      ====================================================== */}

      <Sidebar role="EMPLOYEE" />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="flex-1 min-w-0">
        {/* ===================================================
            NAVBAR
        ==================================================== */}

        <Navbar title="Mentorship" />

        {/* ===================================================
            PAGE CONTENT
        ==================================================== */}

        <main className="p-8">
          {/* =================================================
              HEADER
          ================================================= */}

          

          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {message && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
              {message}
            </div>
          )}

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* =================================================
              1. RECOMMENDED MENTORS
          ================================================= */}

          <section className="mb-10">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  1. Recommended Mentors
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Mentors recommended based on your
                  current skill gaps.
                </p>
              </div>

              <button
                onClick={loadRecommendations}
                disabled={loading}
                className="w-fit rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            </div>

            {loading ? (
              <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                <p className="text-gray-500">
                  Loading mentor recommendations...
                </p>
              </div>
            ) : recommendations.length === 0 ? (
              <EmptyState message="No mentor recommendations available for your current skill gaps." />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {recommendations.map(
                  (mentor, index) => (
                    <div
                      key={`${mentor.id}-${mentor.skillId}-${index}`}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      {/* AVATAR + NAME */}

                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                          {mentor.firstName?.charAt(
                            0
                          ) || ""}
                          {mentor.lastName?.charAt(
                            0
                          ) || ""}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-gray-800">
                            {mentor.firstName}{" "}
                            {mentor.lastName}
                          </h3>

                          <p className="truncate text-xs text-gray-500">
                            {mentor.designation ||
                              "Mentor"}
                          </p>
                        </div>
                      </div>

                      {/* SKILL */}

                      <div className="mt-4 rounded-lg bg-blue-50 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-blue-600">
                          Skill
                        </p>

                        <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                          {mentor.skillName ||
                            "Skill"}
                        </p>

                        <span
                          className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-medium ${getLevelColor(
                            mentor.skillLevel
                          )}`}
                        >
                          {getLevelName(
                            mentor.skillLevel
                          )}
                        </span>
                      </div>

                      {/* REQUEST BUTTON */}

                      <button
                        onClick={() =>
                          openRequestForm(
                            mentor
                          )
                        }
                        disabled={!mentor.skillId}
                        className="mt-4 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {mentor.skillId
                          ? "Request Mentorship"
                          : "Skill Unavailable"}
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          {/* =================================================
              2. MY MENTORSHIP REQUESTS
          ================================================= */}

          <section className="mb-10">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold text-gray-800">
                2. My Mentorship Requests
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Requests you have sent to mentors.
              </p>
            </div>

            {mentorshipLoading ? (
              <EmptyState message="Loading your mentorship requests..." />
            ) : requestedMentorships.length === 0 ? (
              <EmptyState message="You don't have any pending mentorship requests." />
            ) : (
              <div className="space-y-4">
                {requestedMentorships.map(
                  (mentorship) => (
                    <MentorshipCard
                      key={mentorship.id}
                      mentorship={mentorship}
                    />
                  )
                )}
              </div>
            )}
          </section>

          {/* =================================================
              3. MY MENTORSHIPS
          ================================================= */}

          <section className="mb-10">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold text-gray-800">
                3. My Mentorships
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Overview of your accepted, active,
                completed, and rejected mentorships.
              </p>
            </div>

            {mentorships.length === 0 ? (
              <EmptyState message="You don't have any mentorship records yet." />
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {mentorships.map(
                  (mentorship) => (
                    <MentorshipCard
                      key={mentorship.id}
                      mentorship={mentorship}
                    />
                  )
                )}
              </div>
            )}
          </section>

          {/* =================================================
              4. ACTIVE MENTORSHIP STATUS
          ================================================= */}

          <section className="mb-10">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold text-gray-800">
                4. Active Mentorship Status
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Mentorships that are currently active.
              </p>
            </div>

            {activeMentorships.length === 0 ? (
              <EmptyState message="You don't have any active mentorships." />
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {activeMentorships.map(
                  (mentorship) => (
                    <MentorshipCard
                      key={mentorship.id}
                      mentorship={mentorship}
                    />
                  )
                )}
              </div>
            )}
          </section>

          {/* =================================================
              5. ACCEPTED STATUS
          ================================================= */}

          <section className="mb-10">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold text-gray-800">
                5. Accepted Status
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Mentorship requests accepted by
                mentors.
              </p>
            </div>

            {acceptedMentorships.length === 0 ? (
              <EmptyState message="No accepted mentorships." />
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {acceptedMentorships.map(
                  (mentorship) => (
                    <MentorshipCard
                      key={mentorship.id}
                      mentorship={mentorship}
                    />
                  )
                )}
              </div>
            )}
          </section>

          {/* =================================================
              6. REJECTED STATUS
          ================================================= */}

          <section className="mb-10">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold text-gray-800">
                6. Rejected Status
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Mentorship requests that were
                rejected.
              </p>
            </div>

            {rejectedMentorships.length === 0 ? (
              <EmptyState message="You don't have any rejected mentorship requests." />
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {rejectedMentorships.map(
                  (mentorship) => (
                    <MentorshipCard
                      key={mentorship.id}
                      mentorship={mentorship}
                    />
                  )
                )}
              </div>
            )}
          </section>

          {/* =================================================
              7. COMPLETED STATUS
          ================================================= */}

          <section className="mb-10">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold text-gray-800">
                7. Completed Status
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Mentorships that have been
                successfully completed.
              </p>
            </div>

            {completedMentorships.length === 0 ? (
              <EmptyState message="You don't have any completed mentorships yet." />
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {completedMentorships.map(
                  (mentorship) => (
                    <MentorshipCard
                      key={mentorship.id}
                      mentorship={mentorship}
                    />
                  )
                )}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* =====================================================
          REQUEST MODAL
      ====================================================== */}

      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800">
              Request Mentorship
            </h2>

            <p className="mt-2 text-gray-600">
              Send a mentorship request to{" "}
              <span className="font-semibold">
                {selectedMentor.firstName}{" "}
                {selectedMentor.lastName}
              </span>
            </p>

            {/* SELECTED SKILL */}

            <div className="mt-5 rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-600">
                Skill you want to improve
              </p>

              <p className="mt-1 font-semibold text-gray-800">
                {selectedMentor.skillName ||
                  "Not specified"}
              </p>

              <p className="mt-1 text-sm text-gray-600">
                Mentor proficiency:{" "}
                <span className="font-medium">
                  {getLevelName(
                    selectedMentor.skillLevel
                  )}
                </span>
              </p>
            </div>

            {/* GOAL */}

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Mentorship Goal
              </label>

              <textarea
                value={goal}
                onChange={(e) =>
                  setGoal(e.target.value)
                }
                rows="4"
                placeholder={`Example: I want to improve my ${
                  selectedMentor.skillName ||
                  "skill"
                } skills...`}
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* BUTTONS */}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeRequestForm}
                disabled={requesting}
                className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={sendMentorshipRequest}
                disabled={
                  requesting ||
                  !selectedMentor.skillId ||
                  !goal.trim()
                }
                className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {requesting
                  ? "Sending..."
                  : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Mentorship;