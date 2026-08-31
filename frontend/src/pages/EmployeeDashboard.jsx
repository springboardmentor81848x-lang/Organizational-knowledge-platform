import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  BookOpen,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  History,
  ArrowUp,
  ArrowDown,
  Minus,
  MessageSquare,
  ArrowRight,
  UserCheck,
  ShieldCheck,
} from "lucide-react";

import {
  getEmployeeSkills,
  getKnowledgeGapsByEmployee,
} from "../services/platformService";

import axios from "axios";

function EmployeeDashboard() {
  const navigate = useNavigate();
  // =========================================================
  // EMPLOYEE INFORMATION
  // =========================================================

  const firstName = localStorage.getItem("firstName") || "";
  const lastName = localStorage.getItem("lastName") || "";
  const employeeId = localStorage.getItem("employeeId");

  const fullName = [firstName, lastName]
    .filter(Boolean)
    .join(" ");

  // =========================================================
  // STATE
  // =========================================================

  const [skills, setSkills] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [historicalComparison, setHistoricalComparison] = useState(null);
  const [activeChats, setActiveChats] = useState([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // SKILL LEVEL NAMES
  // =========================================================

  const levelNames = {
    1: "Beginner",
    2: "Intermediate",
    3: "Competent",
    4: "Advanced",
    5: "Expert",
  };

  // =========================================================
  // LOAD DASHBOARD DATA
  // =========================================================

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!employeeId) {
        setError("Employee ID not found. Please login again.");
        return;
      }

      // =====================================================
      // 1. CURRENT SKILL INVENTORY
      // =====================================================

      const skillResponse = await getEmployeeSkills(employeeId);

      console.log(
        "Current Skill Inventory:",
        skillResponse.data
      );

      const currentSkills = Array.isArray(skillResponse.data)
        ? skillResponse.data
        : [];

      setSkills(currentSkills);

      // =====================================================
      // 2. STORED KNOWLEDGE GAPS
      // =====================================================

      const gapResponse =
        await getKnowledgeGapsByEmployee(employeeId);

      console.log(
        "Stored Knowledge Gaps:",
        gapResponse.data
      );

      const storedGaps = Array.isArray(gapResponse.data)
        ? gapResponse.data
        : [];

      setGaps(storedGaps);

      // =====================================================
      // 3. PERSISTENT HISTORICAL COMPARISON
      // =====================================================
      //
      // This data MUST come from the database.
      // No sessionStorage/localStorage is used.
      //
      // The backend endpoint should return the MOST RECENT
      // persisted reassessment comparison for this employee.
      //
      // =====================================================

      try {
        const token = localStorage.getItem("token");

        const historicalResponse = await axios.get(
          `http://localhost:8080/api/employee/assessment/history/${employeeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(
          "Persistent Historical Assessment:",
          historicalResponse.data
        );

        const result = historicalResponse.data;

        if (
          result &&
          Array.isArray(result.skillResults) &&
          result.skillResults.length > 0
        ) {
          setHistoricalComparison(result);
        } else {
          setHistoricalComparison(null);
        }
      } catch (historyError) {
        console.error(
          "Historical assessment loading error:",
          historyError
        );

        setHistoricalComparison(null);
      }

      // =====================================================
      // 4. PEER MENTORING ACTIVE CHATS & REQUESTS
      // =====================================================
      try {
        const token = localStorage.getItem("token");
        const authHeaders = { headers: { Authorization: token ? `Bearer ${token}` : "" } };

        const [chatsRes, incomingReqsRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/messages/active-chats/${employeeId}`, authHeaders).catch(() => ({ data: [] })),
          axios.get(`http://localhost:8080/api/mentorships/mentor/${employeeId}`, authHeaders).catch(() => ({ data: [] }))
        ]);

        setActiveChats(Array.isArray(chatsRes.data) ? chatsRes.data : []);
        
        const incoming = Array.isArray(incomingReqsRes.data) ? incomingReqsRes.data : [];
        const pendingCount = incoming.filter(r => r.status?.toUpperCase() === "REQUESTED").length;
        setPendingRequestsCount(pendingCount);
      } catch (chatErr) {
        console.error("Peer mentoring data error:", chatErr);
      }
    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // AVERAGE SKILL LEVEL
  // =========================================================

  const calculateAverageLevel = () => {
    if (skills.length === 0) {
      return 0;
    }

    const totalLevel = skills.reduce(
      (total, item) =>
        total + Number(item.currentLevel || 0),
      0
    );

    return totalLevel / skills.length;
  };

  const averageLevel = calculateAverageLevel();

  // =========================================================
  // SKILL SCORE
  // =========================================================

  const skillScore = Math.round(
    (averageLevel / 5) * 100
  );

  // =========================================================
  // GET SKILL NAME
  // =========================================================

  const getSkillName = (item) => {
    return (
      item?.skill?.skillName ||
      item?.skillName ||
      item?.skill ||
      ""
    );
  };

  // =========================================================
  // FIND MATCHING KNOWLEDGE GAP
  // =========================================================

  const getMatchingGap = (skillName) => {
    if (!skillName) {
      return null;
    }

    return gaps.find((gap) => {
      const gapSkillName =
        gap?.skill?.skillName ||
        gap?.skillName ||
        gap?.skill ||
        "";

      return (
        gapSkillName &&
        gapSkillName.toLowerCase() ===
          skillName.toLowerCase()
      );
    });
  };

  // =========================================================
  // GET REQUIRED LEVEL
  // =========================================================

  const getRequiredLevel = (
    currentLevel,
    matchingGap
  ) => {
    if (!matchingGap) {
      return currentLevel;
    }

    const backendRequiredLevel = Number(
      matchingGap.requiredLevel || 0
    );

    if (backendRequiredLevel > 0) {
      return Math.min(
        Math.max(backendRequiredLevel, 1),
        5
      );
    }

    const backendGap = Number(
      matchingGap.gap || 0
    );

    if (backendGap > 0) {
      return Math.min(
        currentLevel + backendGap,
        5
      );
    }

    return currentLevel;
  };

  // =========================================================
  // GET SKILL GAP
  // =========================================================

  const getSkillGap = (
    currentLevel,
    requiredLevel
  ) => {
    return Math.max(
      requiredLevel - currentLevel,
      0
    );
  };

  // =========================================================
  // CALCULATE ACTUAL KNOWLEDGE GAPS
  // =========================================================

  const getActualKnowledgeGaps = () => {
    if (!skills || skills.length === 0) {
      return [];
    }

    const actualGaps = [];

    skills.forEach((skill) => {
      const skillName = getSkillName(skill);

      if (!skillName) {
        return;
      }

      const currentLevel = Number(
        skill.currentLevel || 0
      );

      const matchingGap =
        getMatchingGap(skillName);

      const requiredLevel =
        getRequiredLevel(
          currentLevel,
          matchingGap
        );

      const actualGap =
        getSkillGap(
          currentLevel,
          requiredLevel
        );

      if (actualGap > 0) {
        actualGaps.push({
          ...(matchingGap || {}),
          skillName,
          currentLevel,
          requiredLevel,
          gap: actualGap,
        });
      }
    });

    return actualGaps;
  };

  const actualKnowledgeGaps =
    getActualKnowledgeGaps();

  const knowledgeGapCount =
    actualKnowledgeGaps.length;

  // =========================================================
  // GAP SEVERITY
  // =========================================================

  const getGapSeverity = (gap) => {
    if (gap === 0) {
      return {
        label: "No Gap",
        badge:
          "bg-green-100 text-green-700",
        border:
          "border-green-200",
        background:
          "bg-green-50",
      };
    }

    if (gap === 1) {
      return {
        label: "Low Gap",
        badge:
          "bg-yellow-100 text-yellow-700",
        border:
          "border-yellow-200",
        background:
          "bg-yellow-50",
      };
    }

    if (gap === 2) {
      return {
        label: "Moderate Gap",
        badge:
          "bg-orange-100 text-orange-700",
        border:
          "border-orange-200",
        background:
          "bg-orange-50",
      };
    }

    return {
      label: "High Gap",
      badge:
        "bg-red-100 text-red-700",
      border:
        "border-red-200",
      background:
        "bg-red-50",
    };
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar role="EMPLOYEE" />

        <div className="flex-1">
          <Navbar title="Employee Dashboard" />

          <div className="p-8">
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-600">
                Loading your skills and knowledge gaps...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="flex min-h-screen">
      <Sidebar role="EMPLOYEE" />

      <div className="flex-1">
        <Navbar title="Employee Dashboard" />

        <main className="p-8">

          {/* =================================================
              WELCOME
          ================================================= */}

          {fullName && (
            <div className="mb-6">
              <p className="text-lg text-gray-600">
                Welcome{" "}
                <span className="font-semibold text-slate-800">
                  {fullName}
                </span>
              </p>
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 bg-red-100 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            {/* TOTAL SKILLS */}

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500">
                    Total Skills
                  </p>

                  <h2 className="text-3xl font-bold mt-3">
                    {skills.length}
                  </h2>
                </div>

                <BookOpen
                  size={45}
                  className="text-indigo-600"
                />
              </div>
            </div>

            {/* AVERAGE LEVEL */}

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500">
                    Average Skill Level
                  </p>

                  <h2 className="text-3xl font-bold mt-3">
                    {averageLevel.toFixed(1)}

                    <span className="text-lg text-gray-500">
                      {" "}/ 5
                    </span>
                  </h2>
                </div>

                <GraduationCap
                  size={45}
                  className="text-green-600"
                />
              </div>
            </div>

            {/* SKILL SCORE */}

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500">
                    Skill Score
                  </p>

                  <h2 className="text-3xl font-bold mt-3">
                    {skillScore}%
                  </h2>
                </div>

                <TrendingUp
                  size={45}
                  className="text-orange-500"
                />
              </div>
            </div>

            {/* KNOWLEDGE GAPS */}

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500">
                    Knowledge Gaps
                  </p>

                  <h2 className="text-3xl font-bold mt-3">
                    {knowledgeGapCount}
                  </h2>
                </div>

                <AlertTriangle
                  size={45}
                  className="text-red-500"
                />
              </div>
            </div>

          </div>

          {/* =================================================
              PEER MENTORING & ACTIVE CHATS
          ================================================= */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-8 border border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <MessageSquare size={18} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Peer Mentoring — Active Chats
                  </h2>
                </div>
                <p className="text-gray-500 mt-1 text-sm">
                  Real-time direct messaging for accepted employee-to-employee peer mentoring.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {pendingRequestsCount > 0 && (
                  <button
                    onClick={() => navigate("/peer-mentoring")}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm animate-pulse"
                  >
                    <span>{pendingRequestsCount} Pending Request{pendingRequestsCount > 1 ? "s" : ""}</span>
                    <ArrowRight size={13} />
                  </button>
                )}

                <button
                  onClick={() => navigate("/messages")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                >
                  <MessageSquare size={14} />
                  <span>Open Messenger</span>
                </button>
              </div>
            </div>

            {activeChats.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
                <p className="text-sm font-semibold text-slate-700">No active peer mentoring chats yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Messaging unlocks once a peer mentoring request is accepted. Find colleagues skilled in your target areas or accept incoming requests.
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  <button
                    onClick={() => navigate("/expert-directory")}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
                  >
                    Find in Expert Directory
                  </button>
                  <button
                    onClick={() => navigate("/peer-mentoring")}
                    className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg transition"
                  >
                    View Peer Mentoring
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeChats.map((chat) => (
                  <div
                    key={chat.mentorshipId}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-white hover:shadow-md transition flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          {chat.skillName} Mentoring
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1.5">
                          {chat.peerName}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {chat.isCurrentUserMentor ? "Your Mentee" : "Your Peer Mentor"} • {chat.peerDesignation || "Colleague"}
                        </p>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Active" />
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 truncate italic">
                      "{chat.lastMessage || "No messages yet"}"
                    </p>

                    <button
                      onClick={() => navigate(`/messages?mentorshipId=${chat.mentorshipId}`)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <MessageSquare size={13} />
                      <span>Open Chat</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* =================================================
              SKILL GAP HEATMAP
          ================================================= */}

          <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">

              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Skill Gap Heatmap
                </h2>

                <p className="text-gray-500 mt-1">
                  Current skill proficiency compared with
                  the required proficiency.
                </p>
              </div>

              <div className="mt-4 md:mt-0 bg-red-50 border border-red-100 rounded-xl px-5 py-3">
                <p className="text-sm text-red-600 font-medium">
                  Knowledge Gaps
                </p>

                <p className="text-2xl font-bold text-red-700">
                  {knowledgeGapCount}
                </p>
              </div>

            </div>

            {skills.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">
                  No skill data available.
                </p>
              </div>
            ) : (
              <div className="space-y-6">

                {skills.map((item, index) => {

                  const skillName =
                    getSkillName(item) ||
                    "Unknown Skill";

                  const currentLevel =
                    Number(
                      item.currentLevel || 0
                    );

                  const matchingGap =
                    getMatchingGap(skillName);

                  const requiredLevel =
                    getRequiredLevel(
                      currentLevel,
                      matchingGap
                    );

                  const skillGap =
                    getSkillGap(
                      currentLevel,
                      requiredLevel
                    );

                  const severity =
                    getGapSeverity(skillGap);

                  const currentPercentage =
                    Math.round(
                      (currentLevel / 5) * 100
                    );

                  const requiredPercentage =
                    Math.round(
                      (requiredLevel / 5) * 100
                    );

                  const levelStyles = {
                    1: {
                      solid:
                        "bg-red-500 text-white",
                      faded:
                        "bg-red-100 text-red-500 border-2 border-dashed border-red-400",
                    },

                    2: {
                      solid:
                        "bg-orange-500 text-white",
                      faded:
                        "bg-orange-100 text-orange-600 border-2 border-dashed border-orange-400",
                    },

                    3: {
                      solid:
                        "bg-yellow-400 text-white",
                      faded:
                        "bg-yellow-100 text-yellow-600 border-2 border-dashed border-yellow-400",
                    },

                    4: {
                      solid:
                        "bg-blue-500 text-white",
                      faded:
                        "bg-blue-100 text-blue-600 border-2 border-dashed border-blue-400",
                    },

                    5: {
                      solid:
                        "bg-green-500 text-white",
                      faded:
                        "bg-green-100 text-green-600 border-2 border-dashed border-green-400",
                    },
                  };

                  return (
                    <div
                      key={item.id || index}
                      className={`border ${severity.border} rounded-xl p-5`}
                    >

                      {/* SKILL HEADER */}

                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                        <div>
                          <h3 className="font-semibold text-lg text-slate-800">
                            {skillName}
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            Current proficiency vs required proficiency
                          </p>
                        </div>

                        <div
                          className={`px-4 py-2 rounded-full text-sm font-semibold ${severity.badge}`}
                        >
                          {severity.label}

                          {skillGap > 0 &&
                            ` · Gap ${skillGap} level${
                              skillGap !== 1
                                ? "s"
                                : ""
                            }`}
                        </div>

                      </div>

                      {/* THREE CARDS */}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

                        {/* CURRENT */}

                        <div className="bg-indigo-50 rounded-xl p-4">
                          <p className="text-sm text-indigo-600 font-medium">
                            Current Level
                          </p>

                          <p className="text-2xl font-bold text-indigo-700 mt-1">
                            {currentLevel}

                            <span className="text-sm font-normal">
                              {" "}/ 5
                            </span>
                          </p>

                          <p className="text-xs text-indigo-500 mt-1">
                            {levelNames[currentLevel] ||
                              "Not Rated"}
                          </p>
                        </div>

                        {/* REQUIRED */}

                        <div className="bg-purple-50 rounded-xl p-4">
                          <p className="text-sm text-purple-600 font-medium">
                            Required Level
                          </p>

                          <p className="text-2xl font-bold text-purple-700 mt-1">
                            {requiredLevel}

                            <span className="text-sm font-normal">
                              {" "}/ 5
                            </span>
                          </p>

                          <p className="text-xs text-purple-500 mt-1">
                            {levelNames[requiredLevel] ||
                              "Not Defined"}
                          </p>
                        </div>

                        {/* GAP */}

                        <div
                          className={`${severity.background} rounded-xl p-4`}
                        >
                          <p className="text-sm font-medium">
                            Skill Gap
                          </p>

                          <p className="text-2xl font-bold mt-1">
                            {skillGap}

                            <span className="text-sm font-normal">
                              {" "}level
                              {skillGap !== 1
                                ? "s"
                                : ""}
                            </span>
                          </p>

                          <p className="text-xs mt-1">
                            {skillGap === 0
                              ? "Requirement achieved"
                              : "Needs improvement"}
                          </p>
                        </div>

                      </div>

                      {/* FIVE LEVEL HEATMAP */}

                      <div className="mt-6">

                        <div className="grid grid-cols-5 gap-2">

                          {[1, 2, 3, 4, 5].map(
                            (cell) => {

                              const isCurrent =
                                cell <=
                                currentLevel;

                              const isRequired =
                                cell <=
                                requiredLevel;

                              const isGap =
                                !isCurrent &&
                                isRequired;

                              const style =
                                levelStyles[cell];

                              let cellClass =
                                "bg-slate-100 text-slate-400 border border-slate-200";

                              if (isCurrent) {
                                cellClass =
                                  `${style.solid} border-2 border-transparent shadow-md`;
                              }

                              if (isGap) {
                                cellClass =
                                  `${style.faded} shadow-inner`;
                              }

                              return (
                                <div
                                  key={cell}
                                  className={`
                                    h-16
                                    rounded-lg
                                    flex
                                    flex-col
                                    items-center
                                    justify-center
                                    ${cellClass}
                                  `}
                                >

                                  <span className="font-bold text-lg">
                                    {cell}
                                  </span>

                                  <span className="text-[10px] mt-1">
                                    {levelNames[cell]}
                                  </span>

                                  {isGap && (
                                    <span className="text-[9px] font-bold mt-1">
                                      GAP
                                    </span>
                                  )}

                                </div>
                              );
                            }
                          )}

                        </div>

                        {/* HEATMAP LEGEND */}

                        <div className="mt-4 flex flex-wrap gap-5 text-sm">

                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-indigo-500"></span>

                            <span className="text-gray-600">
                              Current proficiency
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-slate-100 border-2 border-dashed border-red-400"></span>

                            <span className="text-gray-600">
                              Required but not achieved
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-slate-100 border border-slate-200"></span>

                            <span className="text-gray-600">
                              Not required
                            </span>
                          </div>

                        </div>

                      </div>

                      {/* ACHIEVEMENT BAR */}

                      <div className="mt-6">

                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                          <span>
                            Skill achievement
                          </span>

                          <span>
                            Current {currentPercentage}%
                            {" / "}
                            Required {requiredPercentage}%
                          </span>
                        </div>

                        <div className="relative w-full bg-gray-200 rounded-full h-3">

                          <div
                            className="bg-indigo-500 h-3 rounded-full"
                            style={{
                              width:
                                `${currentPercentage}%`,
                            }}
                          />

                          <div
                            className="absolute top-0 w-1 h-3 bg-purple-700"
                            style={{
                              left:
                                `calc(${requiredPercentage}% - 2px)`,
                            }}
                          />

                        </div>

                        <div className="flex justify-between mt-2 text-xs">

                          <span className="text-indigo-600">
                            ● Current level
                          </span>

                          <span className="text-purple-700">
                            │ Required level
                          </span>

                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

            {/* GAP SEVERITY LEGEND */}

            <div className="mt-8 pt-6 border-t">

              <h3 className="text-sm font-semibold text-slate-700 mb-4">
                Gap Severity
              </h3>

              <div className="flex flex-wrap gap-3">

                <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-green-700">
                    No Gap
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg">
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm text-yellow-700">
                    Low Gap
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-sm text-orange-700">
                    Moderate Gap
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-red-700">
                    High Gap
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              PERSISTENT HISTORICAL ASSESSMENT COMPARISON
          ================================================= */}

          <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">

            {/* HEADER */}

            <div className="flex items-start gap-4 mb-6">

              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <History
                  size={30}
                  className="text-purple-600"
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Historical Assessment Comparison
                </h2>

                <p className="text-gray-500 mt-1">
                  Compare your skill levels before and after reassessment.
                </p>
              </div>

            </div>

            {/* =================================================
                NO HISTORICAL DATA
            ================================================= */}

            {!historicalComparison ||
            !Array.isArray(
              historicalComparison.skillResults
            ) ||
            historicalComparison.skillResults.length === 0 ? (

              <div className="border border-slate-200 bg-slate-50 rounded-xl py-12 text-center">

                <History
                  size={52}
                  className="text-slate-400 mx-auto mb-4"
                />

                <h3 className="text-xl font-semibold text-slate-700">
                  No historical assessment data available.
                </h3>

                <p className="text-slate-400 mt-2">
                  Complete a reassessment to see your skill improvement here.
                </p>

              </div>

            ) : (

              <>
                {/* =================================================
                    LATEST ASSESSMENT INFORMATION
                ================================================= */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

                  {/* OVERALL SCORE */}

                  <div className="bg-indigo-50 rounded-xl p-5">

                    <p className="text-sm text-indigo-600 font-medium">
                      Latest Overall Score
                    </p>

                    <p className="text-3xl font-bold text-indigo-700 mt-2">
                      {Number(
                        historicalComparison.overallScore || 0
                      ).toFixed(1)}
                      %
                    </p>

                  </div>

                  {/* PERFORMANCE LEVEL */}

                  <div className="bg-green-50 rounded-xl p-5">

                    <p className="text-sm text-green-600 font-medium">
                      Performance Level
                    </p>

                    <p className="text-2xl font-bold text-green-700 mt-3">
                      {historicalComparison.performanceLevel ||
                        "Calculated"}
                    </p>

                  </div>

                  {/* ASSESSMENT DATE */}

                  <div className="bg-purple-50 rounded-xl p-5">

                    <p className="text-sm text-purple-600 font-medium">
                      Latest Reassessment
                    </p>

                    <p className="text-lg font-bold text-purple-700 mt-3">
                      {historicalComparison.assessmentDate
                        ? new Date(
                            historicalComparison.assessmentDate
                          ).toLocaleString()
                        : "Recently completed"}
                    </p>

                  </div>

                </div>

                {/* =================================================
                    COMPARISON TABLE
                ================================================= */}

                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead>

                      <tr className="border-b border-slate-200">

                        <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600">
                          Skill
                        </th>

                        <th className="text-center py-4 px-4 text-sm font-semibold text-slate-600">
                          Previous Level
                        </th>

                        <th className="text-center py-4 px-4 text-sm font-semibold text-slate-600">
                          Current Level
                        </th>

                        <th className="text-center py-4 px-4 text-sm font-semibold text-slate-600">
                          Improvement
                        </th>

                        <th className="text-center py-4 px-4 text-sm font-semibold text-slate-600">
                          Remaining Gap
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {historicalComparison.skillResults.map(
                        (skill, index) => {

                          const improvement =
                            Number(
                              skill.improvement || 0
                            );

                          const remainingGap =
                            Number(
                              skill.remainingGap || 0
                            );

                          return (
                            <tr
                              key={
                                skill.skillName ||
                                index
                              }
                              className="border-b border-slate-100 hover:bg-slate-50"
                            >

                              {/* SKILL */}

                              <td className="py-4 px-4">

                                <span className="font-semibold text-slate-800">
                                  {skill.skillName ||
                                    "Unknown Skill"}
                                </span>

                              </td>

                              {/* PREVIOUS LEVEL */}

                              <td className="py-4 px-4 text-center">

                                <div className="flex flex-col items-center">

                                  <span className="font-semibold text-slate-700">
                                    {skill.previousLevelName ||
                                      skill.previousLevel ||
                                      "Not Rated"}
                                  </span>

                                  {skill.previousLevel !==
                                    null &&
                                    skill.previousLevel !==
                                      undefined && (
                                      <span className="text-xs text-slate-400 mt-1">
                                        Level{" "}
                                        {skill.previousLevel}
                                        {" / 5"}
                                      </span>
                                    )}

                                </div>

                              </td>

                              {/* CURRENT LEVEL */}

                              <td className="py-4 px-4 text-center">

                                <div className="flex flex-col items-center">

                                  <span className="font-semibold text-indigo-600">
                                    {skill.currentLevelName ||
                                      skill.currentLevel ||
                                      "Not Rated"}
                                  </span>

                                  {skill.currentLevel !==
                                    null &&
                                    skill.currentLevel !==
                                      undefined && (
                                      <span className="text-xs text-indigo-400 mt-1">
                                        Level{" "}
                                        {skill.currentLevel}
                                        {" / 5"}
                                      </span>
                                    )}

                                </div>

                              </td>

                              {/* IMPROVEMENT */}

                              <td className="py-4 px-4 text-center">

                                {improvement > 0 ? (

                                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-semibold text-sm">

                                    <ArrowUp size={15} />

                                    +{improvement}

                                  </span>

                                ) : improvement < 0 ? (

                                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-100 text-red-700 font-semibold text-sm">

                                    <ArrowDown size={15} />

                                    {improvement}

                                  </span>

                                ) : (

                                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-sm">

                                    <Minus size={15} />

                                    0

                                  </span>

                                )}

                              </td>

                              {/* REMAINING GAP */}

                              <td className="py-4 px-4 text-center">

                                {remainingGap === 0 ? (

                                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                                    No Gap
                                  </span>

                                ) : (

                                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm">

                                    {remainingGap}{" "}

                                    {remainingGap === 1
                                      ? "level"
                                      : "levels"}

                                  </span>

                                )}

                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>

                {/* INFORMATION */}

                <div className="mt-6 bg-purple-50 border border-purple-100 rounded-xl p-4">

                  <p className="text-sm text-purple-700">

                    <span className="font-semibold">
                      Comparison:
                    </span>{" "}

                    Previous level represents your proficiency
                    before reassessment, while Current level
                    represents your latest reassessment result.

                  </p>

                </div>

              </>
            )}

          </div>

          {/* =================================================
              RECOMMENDED LEARNING
          ================================================= */}

          <div className="bg-white rounded-xl shadow p-6 mt-8">

            <h2 className="text-xl font-bold mb-5">
              Recommended Learning
            </h2>

            {knowledgeGapCount === 0 ? (

              <p className="text-green-600">
                You have no major knowledge gaps.
              </p>

            ) : (

              <div className="space-y-4">

                {actualKnowledgeGaps
                  .slice(0, 4)
                  .map((gap, index) => {

                    const skillName =
                      gap.skillName ||
                      "Unknown Skill";

                    return (
                      <div
                        key={
                          gap.id ||
                          index
                        }
                        className="border rounded-lg p-4"
                      >

                        <span className="font-medium">
                          Learn {skillName}
                        </span>

                      </div>
                    );
                  })}

              </div>
            )}

          </div>

          {/* =================================================
              RECENT ACTIVITY
          ================================================= */}

          <div className="bg-white rounded-xl shadow p-6 mt-8">

            <h2 className="text-xl font-bold mb-5">
              Recent Activity
            </h2>

            <p className="text-gray-500">
              Activity tracking will be available
              when the activity module is implemented.
            </p>

          </div>

        </main>
      </div>
    </div>
  );
}

export default EmployeeDashboard;