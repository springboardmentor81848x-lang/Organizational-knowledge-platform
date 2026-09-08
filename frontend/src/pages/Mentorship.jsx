import React, { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../services/api";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  RefreshCw,
  Search,
} from "lucide-react";

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
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [activeTab, setActiveTab] =
    useState("active-chats");

  // "active-chats" | "requests" | "recommendations" | "all"
  const [recommendations, setRecommendations] =
    useState([]);

  const [sentMentorships, setSentMentorships] =
    useState([]);

  const [receivedMentorships, setReceivedMentorships] =
    useState([]);

  const [loading, setLoading] = useState(false);
  const [mentorshipLoading, setMentorshipLoading] =
    useState(false);

  const [requesting, setRequesting] =
    useState(false);

  const [processingId, setProcessingId] =
    useState(null);

  const [selectedMentor, setSelectedMentor] =
    useState(null);

  const [goal, setGoal] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // LOGGED-IN EMPLOYEE
  // =========================================================

  const employeeId =
    localStorage.getItem("employeeId");

  const currentRole =
    localStorage.getItem("role") ||
    localStorage.getItem("userRole") ||
    "EMPLOYEE";

  // =========================================================
  // LOAD RECOMMENDED MENTORS
  // =========================================================

  const loadRecommendations = async () => {
    if (!employeeId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/mentor-allocations/employee/${employeeId}`
      );

      setRecommendations(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load mentor recommendations:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD MENTORSHIPS
  // Both as mentee and as mentor
  // =========================================================

  const loadMentorships = async () => {
    if (!employeeId) {
      return;
    }

    try {
      setMentorshipLoading(true);

      const [sentRes, receivedRes] =
        await Promise.all([
          api
            .get(
              `/mentorships/employee/${employeeId}`
            )
            .catch(() => ({
              data: [],
            })),

          api
            .get(
              `/mentorships/mentor/${employeeId}`
            )
            .catch(() => ({
              data: [],
            })),
        ]);

      setSentMentorships(
        Array.isArray(sentRes.data)
          ? sentRes.data
          : []
      );

      setReceivedMentorships(
        Array.isArray(receivedRes.data)
          ? receivedRes.data
          : []
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

  useEffect(() => {
    loadRecommendations();
    loadMentorships();
  }, [employeeId]);

  // =========================================================
  // ACCEPT MENTORSHIP REQUESTS
  // =========================================================

  const handleAcceptRequest = async (
    mentorshipId
  ) => {
    try {
      setProcessingId(mentorshipId);
      setError("");
      setMessage("");

      await api.put(
        `/mentorships/${mentorshipId}/accept`,
        null
      );

      setMessage(
        "Peer mentorship request accepted! You can now start chatting."
      );

      await loadMentorships();

      setActiveTab("active-chats");
    } catch (err) {
      console.error(
        "Failed to accept mentorship:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to accept mentorship request."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================================
  // REJECT MENTORSHIP REQUEST
  // =========================================================

  const handleRejectRequest = async (
    mentorshipId
  ) => {
    try {
      setProcessingId(mentorshipId);
      setError("");
      setMessage("");

      await api.put(
        `/mentorships/${mentorshipId}/reject`,
        null
      );

      setMessage(
        "Mentorship request rejected."
      );

      await loadMentorships();
    } catch (err) {
      console.error(
        "Failed to reject mentorship:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to reject mentorship request."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================================
  // SEND MENTORSHIP REQUEST
  // =========================================================

  const openRequestForm = (mentor) => {
    if (!mentor.skillId) {
      setError(
        `Skill ID is missing for ${
          mentor.firstName || ""
        } ${mentor.lastName || ""}.`
      );

      return;
    }

    setSelectedMentor(mentor);
    setGoal("");
    setMessage("");
    setError("");
  };

  const closeRequestForm = () => {
    if (requesting) {
      return;
    }

    setSelectedMentor(null);
    setGoal("");
  };

  const sendMentorshipRequest = async () => {
    if (
      !selectedMentor ||
      !employeeId ||
      !goal.trim()
    ) {
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

      params.append(
        "skillId",
        String(selectedMentor.skillId)
      );

      params.append(
        "goal",
        goal.trim()
      );

      await api.post(
        `/mentorships?${params.toString()}`,
        null
      );

      setMessage(
        `Mentorship request sent successfully to ${
          selectedMentor.firstName || ""
        } ${selectedMentor.lastName || ""}!`
      );

      setSelectedMentor(null);
      setGoal("");

      await loadMentorships();

      setActiveTab("requests");
    } catch (err) {
      console.error(
        "Failed to send mentorship request:",
        err
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
  // ACTIVE CHATS LIST
  // Combined Accepted / Active mentorships
  // =========================================================

  const activeChatsList = useMemo(() => {
    const combined = [
      ...sentMentorships,
      ...receivedMentorships,
    ];

    const unique = new Map();

    combined.forEach((item) => {
      const status =
        item.status?.toUpperCase();

      if (
        (status === "ACCEPTED" ||
          status === "ACTIVE") &&
        !unique.has(item.id)
      ) {
        unique.set(item.id, item);
      }
    });

    return Array.from(
      unique.values()
    );
  }, [
    sentMentorships,
    receivedMentorships,
  ]);

  // =========================================================
  // PENDING INCOMING REQUESTS
  // Current user is the mentor
  // =========================================================

  const pendingIncomingRequests =
    useMemo(() => {
      return receivedMentorships.filter(
        (m) =>
          m.status?.toUpperCase() ===
          "REQUESTED"
      );
    }, [receivedMentorships]);

  // =========================================================
  // PENDING OUTGOING REQUESTS
  // Current user requested another peer
  // =========================================================

  const pendingSentRequests =
    useMemo(() => {
      return sentMentorships.filter(
        (m) =>
          m.status?.toUpperCase() ===
          "REQUESTED"
      );
    }, [sentMentorships]);

  // =========================================================
  // ALL RECORDS
  // =========================================================

  const allRecords = useMemo(() => {
    const combined = [
      ...sentMentorships,
      ...receivedMentorships,
    ];

    const unique = new Map();

    combined.forEach((item) => {
      if (!unique.has(item.id)) {
        unique.set(item.id, item);
      }
    });

    return Array.from(
      unique.values()
    );
  }, [
    sentMentorships,
    receivedMentorships,
  ]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar role={currentRole} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Peer Mentoring" />

        <main className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">

          {/* Header Banner */}

          <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-100 text-xs font-semibold backdrop-blur-sm border border-white/20">
                  <Sparkles
                    size={14}
                    className="text-yellow-300"
                  />

                  Employee-to-Employee Peer Mentorship & Messaging
                </div>

                <h1 className="text-3xl font-bold tracking-tight">
                  Peer Mentoring
                </h1>

                <p className="text-blue-100 text-sm md:text-base leading-relaxed">
                  Connect with internal experts, accept mentoring requests from colleagues, and exchange knowledge through direct messaging.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    navigate(
                      "/expert-directory"
                    )
                  }
                  className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
                >
                  <Search size={15} />
                  Find in Expert Directory
                </button>

                <button
                  onClick={() =>
                    navigate("/messages")
                  }
                  className="px-4 py-2.5 bg-blue-500/30 hover:bg-blue-500/50 text-white font-bold text-xs rounded-xl border border-white/30 backdrop-blur-sm transition flex items-center gap-2"
                >
                  <MessageSquare size={15} />
                  Open Messenger
                </button>
              </div>
            </div>
          </div>

          {/* Feedback Messages */}

          {message && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle
                  size={18}
                  className="text-emerald-600 shrink-0"
                />

                <span>{message}</span>
              </div>

              <button
                onClick={() =>
                  setMessage("")
                }
                className="font-bold text-emerald-600"
              >
                ✕
              </button>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <XCircle
                  size={18}
                  className="text-red-600 shrink-0"
                />

                <span>{error}</span>
              </div>

              <button
                onClick={() =>
                  setError("")
                }
                className="font-bold text-red-600"
              >
                ✕
              </button>
            </div>
          )}

          {/* Navigation Tabs */}

          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
            <div className="flex items-center gap-2">

              {/* Active Chats */}

              <button
                onClick={() =>
                  setActiveTab(
                    "active-chats"
                  )
                }
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2 ${
                  activeTab ===
                  "active-chats"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <MessageSquare size={16} />

                <span>
                  Active Chats
                </span>

                <span
                  className={`px-2 py-0.5 text-[11px] rounded-full ${
                    activeTab ===
                    "active-chats"
                      ? "bg-blue-800 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {activeChatsList.length}
                </span>
              </button>

              {/* Requests */}

              <button
                onClick={() =>
                  setActiveTab(
                    "requests"
                  )
                }
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2 ${
                  activeTab ===
                  "requests"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Clock size={16} />

                <span>
                  Requests
                </span>

                {pendingIncomingRequests.length >
                  0 && (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-500 text-white animate-pulse">
                    {
                      pendingIncomingRequests.length
                    }{" "}
                    New
                  </span>
                )}
              </button>

              {/* Recommended Mentors */}

              <button
                onClick={() =>
                  setActiveTab(
                    "recommendations"
                  )
                }
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2 ${
                  activeTab ===
                  "recommendations"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Award size={16} />

                <span>
                  Recommended Mentors
                </span>

                <span
                  className={`px-2 py-0.5 text-[11px] rounded-full ${
                    activeTab ===
                    "recommendations"
                      ? "bg-blue-800 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {recommendations.length}
                </span>
              </button>

              {/* All Records */}

              <button
                onClick={() =>
                  setActiveTab("all")
                }
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2 ${
                  activeTab === "all"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Users size={16} />

                <span>
                  All Mentorships
                </span>
              </button>
            </div>

            <button
              onClick={() => {
                loadMentorships();
                loadRecommendations();
              }}
              disabled={
                mentorshipLoading
              }
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
            >
              <RefreshCw
                size={12}
                className={
                  mentorshipLoading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>

          {/* ========================================================
              TAB 1: ACTIVE CHATS
          ======================================================== */}

          {activeTab ===
            "active-chats" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span>
                      Active Peer Mentorship Chats
                    </span>

                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      Messaging Enabled
                    </span>
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Peer mentorships accepted by both parties. Click{" "}
                    <strong>[Open Chat]</strong>{" "}
                    to send messages.
                  </p>
                </div>
              </div>

              {mentorshipLoading ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                  <RefreshCw
                    className="mx-auto text-blue-600 animate-spin mb-3"
                    size={32}
                  />

                  <p className="text-sm text-slate-600">
                    Loading active mentoring chats...
                  </p>
                </div>
              ) : activeChatsList.length ===
                0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center shadow-sm space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <MessageSquare
                      size={28}
                    />
                  </div>

                  <h3 className="text-base font-bold text-slate-800">
                    No Active Chats Yet
                  </h3>

                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Active chats appear once a mentorship request is accepted. You can find experts in the Expert Directory or check your pending requests.
                  </p>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() =>
                        navigate(
                          "/expert-directory"
                        )
                      }
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Browse Expert Directory
                    </button>

                    {pendingIncomingRequests.length >
                      0 && (
                      <button
                        onClick={() =>
                          setActiveTab(
                            "requests"
                          )
                        }
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition"
                      >
                        Review Pending Requests (
                        {
                          pendingIncomingRequests.length
                        }
                        )
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {activeChatsList.map(
                    (m) => {
                      const isMentor =
                        String(
                          m.mentor?.employeeId
                        ) ===
                          String(
                            employeeId
                          ) ||
                        String(
                          m.mentor?.id
                        ) ===
                          String(
                            localStorage.getItem(
                              "userId"
                            )
                          );

                      const mentorName =
                        `${m.mentor?.firstName || ""} ${
                          m.mentor?.lastName || ""
                        }`.trim() ||
                        "Mentor";

                      const menteeName =
                        `${m.mentee?.firstName || ""} ${
                          m.mentee?.lastName || ""
                        }`.trim() ||
                        "Mentee";

                      const skillName =
                        m.skill?.skillName ||
                        "Peer Mentoring";

                      return (
                        <div
                          key={m.id}
                          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                        >
                          {/* Topic Header */}

                          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />

                                <h3 className="font-bold text-slate-900 text-base">
                                  {skillName}{" "}
                                  Mentoring
                                </h3>
                              </div>

                              <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                                <ShieldCheck size={12} />{" "}
                                Accepted Peer Relationship
                              </span>
                            </div>

                            <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {m.status}
                            </span>
                          </div>

                          {/* Participants */}

                          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">

                            {/* Mentor */}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                                  {mentorName.charAt(
                                    0
                                  )}
                                </div>

                                <div>
                                  <span className="font-bold text-slate-800 block leading-tight">
                                    {mentorName}
                                  </span>

                                  <span className="text-[10px] text-slate-400">
                                    Mentor •{" "}
                                    {m.mentor?.designation ||
                                      "Expert"}
                                  </span>
                                </div>
                              </div>

                              {isMentor && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                                  You
                                </span>
                              )}
                            </div>

                            {/* Mentee */}

                            <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                                  {menteeName.charAt(
                                    0
                                  )}
                                </div>

                                <div>
                                  <span className="font-bold text-slate-800 block leading-tight">
                                    {menteeName}
                                  </span>

                                  <span className="text-[10px] text-slate-400">
                                    Mentee •{" "}
                                    {m.mentee?.designation ||
                                      "Learner"}
                                  </span>
                                </div>
                              </div>

                              {!isMentor && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                                  You
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Goal */}

                          {m.goal && (
                            <div className="text-xs text-slate-600 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/60 italic line-clamp-2">
                              "{m.goal}"
                            </div>
                          )}

                          {/* Open Chat */}

                          <button
                            onClick={() =>
                              navigate(
                                `/messages?mentorshipId=${m.id}`
                              )
                            }
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                          >
                            <MessageSquare
                              size={14}
                            />

                            <span>
                              Open Chat
                            </span>

                            <ArrowRight
                              size={13}
                            />
                          </button>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB 2: REQUESTS
          ======================================================== */}

          {activeTab ===
            "requests" && (
            <div className="space-y-8">

              {/* INCOMING */}

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span>
                        Incoming Mentorship Requests
                      </span>

                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {
                          pendingIncomingRequests.length
                        }{" "}
                        Pending
                      </span>
                    </h3>

                    <p className="text-xs text-slate-500">
                      Peers who found your expertise in the directory and requested your mentorship.
                    </p>
                  </div>
                </div>

                {pendingIncomingRequests.length ===
                0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                    No pending incoming mentorship requests at this time.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingIncomingRequests.map(
                      (req) => {
                        const menteeName =
                          `${req.mentee?.firstName || ""} ${
                            req.mentee?.lastName || ""
                          }`.trim() ||
                          "Peer Colleague";

                        const isProcessing =
                          processingId ===
                          req.id;

                        return (
                          <div
                            key={req.id}
                            className="bg-white rounded-2xl border-2 border-amber-200/70 p-5 shadow-sm space-y-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold flex items-center justify-center shadow-sm text-sm">
                                  {menteeName.charAt(
                                    0
                                  )}
                                </div>

                                <div>
                                  <h4 className="font-bold text-slate-900 text-sm">
                                    {menteeName}
                                  </h4>

                                  <p className="text-xs text-slate-500">
                                    {
                                      req.mentee?.designation
                                    }{" "}
                                    •{" "}
                                    {req.mentee?.department?.departmentName ||
                                      "Engineering"}
                                  </p>
                                </div>
                              </div>

                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                Requested
                              </span>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                              <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">
                                  Requested Skill:
                                </span>

                                <span className="font-bold text-slate-900">
                                  {
                                    req.skill?.skillName
                                  }
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">
                                  Date Requested:
                                </span>

                                <span className="text-slate-600">
                                  {req.startDate ||
                                    "Recent"}
                                </span>
                              </div>

                              {req.goal && (
                                <div className="pt-1.5 border-t border-slate-200">
                                  <span className="text-slate-400 block font-medium mb-0.5">
                                    Mentee's Goal:
                                  </span>

                                  <p className="text-slate-700 italic">
                                    "{req.goal}"
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                              <button
                                onClick={() =>
                                  handleRejectRequest(
                                    req.id
                                  )
                                }
                                disabled={
                                  isProcessing
                                }
                                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                              >
                                <XCircle
                                  size={14}
                                  className="text-slate-500"
                                />

                                <span>
                                  Decline
                                </span>
                              </button>

                              <button
                                onClick={() =>
                                  handleAcceptRequest(
                                    req.id
                                  )
                                }
                                disabled={
                                  isProcessing
                                }
                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                              >
                                {isProcessing ? (
                                  <RefreshCw
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <>
                                    <CheckCircle
                                      size={
                                        14
                                      }
                                    />

                                    <span>
                                      Accept & Start Chat
                                    </span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {/* SENT */}

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Sent Mentorship Requests
                    </h3>

                    <p className="text-xs text-slate-500">
                      Requests you sent to internal experts from the Expert Directory.
                    </p>
                  </div>
                </div>

                {pendingSentRequests.length ===
                0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                    No pending sent mentorship requests.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingSentRequests.map(
                      (req) => {
                        const mentorName =
                          `${req.mentor?.firstName || ""} ${
                            req.mentor?.lastName || ""
                          }`.trim() ||
                          "Expert";

                        return (
                          <div
                            key={req.id}
                            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                                  {mentorName.charAt(
                                    0
                                  )}
                                </div>

                                <div>
                                  <h4 className="font-bold text-slate-900 text-sm">
                                    {mentorName}
                                  </h4>

                                  <p className="text-xs text-slate-500">
                                    {req.mentor?.designation ||
                                      "Expert Mentor"}
                                  </p>
                                </div>
                              </div>

                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                Pending Acceptance
                              </span>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                              <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">
                                  Skill:
                                </span>

                                <span className="font-semibold text-slate-800">
                                  {
                                    req.skill?.skillName
                                  }
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">
                                  Request Date:
                                </span>

                                <span className="text-slate-600">
                                  {req.startDate ||
                                    "Recent"}
                                </span>
                              </div>

                              {req.goal && (
                                <div className="pt-1 text-slate-600 italic">
                                  "{req.goal}"
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: RECOMMENDED MENTORS
          ======================================================== */}

          {activeTab ===
            "recommendations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Recommended Mentors for Your Skill Gaps
                  </h2>

                  <p className="text-xs text-slate-500">
                    Colleagues with advanced proficiency in topics you are currently targeting.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <RefreshCw
                    className="mx-auto text-blue-600 animate-spin mb-3"
                    size={32}
                  />

                  <p className="text-sm text-slate-600">
                    Loading recommendations...
                  </p>
                </div>
              ) : recommendations.length ===
                0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                  <p className="text-sm text-slate-500">
                    No mentor recommendations available for your current skill gaps.
                  </p>

                  <button
                    onClick={() =>
                      navigate(
                        "/expert-directory"
                      )
                    }
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Search Expert Directory
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recommendations.map(
                    (mentor, index) => (
                      <div
                        key={`${mentor.id}-${mentor.skillId}-${index}`}
                        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shrink-0">
                            {mentor.firstName?.charAt(
                              0
                            ) || "M"}
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-xs truncate">
                              {mentor.firstName}{" "}
                              {mentor.lastName}
                            </h4>

                            <p className="text-[11px] text-slate-500 truncate">
                              {mentor.designation ||
                                "Mentor"}
                            </p>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-2.5 rounded-xl text-xs">
                          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">
                            Skill
                          </span>

                          <span className="font-semibold text-slate-900 block truncate mt-0.5">
                            {mentor.skillName}
                          </span>

                          <span
                            className={`mt-1.5 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              levelColors[
                                mentor.skillLevel
                              ] || ""
                            }`}
                          >
                            {levelNames[
                              mentor.skillLevel
                            ] ||
                              `Level ${mentor.skillLevel}`}
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            openRequestForm(
                              mentor
                            )
                          }
                          disabled={
                            !mentor.skillId
                          }
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Send size={12} />

                          <span>
                            Request Mentorship
                          </span>
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB 4: ALL MENTORSHIP RECORDS
          ======================================================== */}

          {activeTab === "all" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    All Mentorship Records
                  </h2>

                  <p className="text-xs text-slate-500">
                    Complete log of accepted, requested, completed, or declined mentorships.
                  </p>
                </div>
              </div>

              {allRecords.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 text-xs">
                  No mentorship records found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allRecords.map((m) => {
                    const status =
                      m.status?.toUpperCase();

                    const isAccepted =
                      status ===
                        "ACCEPTED" ||
                      status ===
                        "ACTIVE";

                    return (
                      <div
                        key={m.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {m.skill?.skillName ||
                              "Mentoring"}
                          </h4>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              isAccepted
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {m.status}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                          <p className="text-slate-600">
                            <strong>
                              Mentor:
                            </strong>{" "}
                            {m.mentor?.firstName}{" "}
                            {m.mentor?.lastName}
                          </p>

                          <p className="text-slate-600">
                            <strong>
                              Mentee:
                            </strong>{" "}
                            {m.mentee?.firstName}{" "}
                            {m.mentee?.lastName}
                          </p>
                        </div>

                        {isAccepted && (
                          <button
                            onClick={() =>
                              navigate(
                                `/messages?mentorshipId=${m.id}`
                              )
                            }
                            className="w-full py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1"
                          >
                            <MessageSquare
                              size={13}
                            />

                            <span>
                              Open Chat
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ========================================================
          REQUEST MODAL
      ======================================================== */}

      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-5">

            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users
                    size={18}
                    className="text-blue-600"
                  />

                  Request Peer Mentorship
                </h3>

                <p className="text-xs text-slate-500 mt-0.5">
                  Send a mentorship request to{" "}
                  {selectedMentor.firstName}{" "}
                  {selectedMentor.lastName}
                </p>
              </div>

              <button
                onClick={closeRequestForm}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 text-xs space-y-1">
              <span className="text-slate-400 font-medium">
                Skill Area:
              </span>

              <p className="font-bold text-slate-900 text-sm">
                {selectedMentor.skillName}
              </p>

              <p className="text-slate-600 mt-1">
                Mentor Proficiency:{" "}
                <span className="font-semibold text-blue-700">
                  {
                    levelNames[
                      selectedMentor.skillLevel
                    ]
                  }
                </span>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Mentorship Goal / Message{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <textarea
                value={goal}
                onChange={(e) =>
                  setGoal(e.target.value)
                }
                rows={4}
                placeholder={`Example: Hello ${selectedMentor.firstName}, I want to strengthen my understanding in ${selectedMentor.skillName}...`}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={closeRequestForm}
                disabled={requesting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>

              <button
                onClick={
                  sendMentorshipRequest
                }
                disabled={
                  requesting ||
                  !goal.trim()
                }
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {requesting ? (
                  <RefreshCw
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <>
                    <Send size={14} />

                    <span>
                      Send Request
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Mentorship;