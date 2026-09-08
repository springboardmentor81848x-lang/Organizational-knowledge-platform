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
  UserCheck,
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
  const [historicalComparison, setHistoricalComparison] =
    useState(null);

  // =========================================================
  // EMPLOYEE MENTORSHIP
  // =========================================================

  const [mentorRecommendations, setMentorRecommendations] =
    useState([]);

  const [myMentorships, setMyMentorships] =
    useState([]);

  const [requestingMentorId, setRequestingMentorId] =
    useState(null);

  const [mentorshipMessage, setMentorshipMessage] =
    useState("");

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
        setError(
          "Employee ID not found. Please login again."
        );
        return;
      }

      // =====================================================
      // 1. CURRENT SKILL INVENTORY
      // =====================================================

      const skillResponse =
        await getEmployeeSkills(employeeId);

      console.log(
        "Current Skill Inventory:",
        skillResponse.data
      );

      const currentSkills =
        Array.isArray(skillResponse.data)
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

      const storedGaps =
        Array.isArray(gapResponse.data)
          ? gapResponse.data
          : [];

      setGaps(storedGaps);

      // =====================================================
      // 3. PERSISTENT HISTORICAL COMPARISON
      // =====================================================

      try {
        const token =
          localStorage.getItem("token");

        const historicalResponse =
          await axios.get(
            `http://localhost:8080/api/employee/reassessment/latest/${employeeId}`,
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

        const result =
          historicalResponse.data;

        if (
          result &&
          Array.isArray(result.skillResults) &&
          result.skillResults.length > 0
        ) {
          setHistoricalComparison(result);
        } else {
          const storedResult =
            sessionStorage.getItem(
              "reassessmentResult"
            );

          if (storedResult) {
            const parsed =
              JSON.parse(storedResult);

            if (
              parsed &&
              Array.isArray(parsed.skillResults) &&
              parsed.skillResults.length > 0
            ) {
              setHistoricalComparison(parsed);
            } else {
              setHistoricalComparison(null);
            }
          } else {
            setHistoricalComparison(null);
          }
        }
      } catch (historyError) {
        console.error(
          "Historical assessment loading error:",
          historyError
        );

        const storedResult =
          sessionStorage.getItem(
            "reassessmentResult"
          );

        if (storedResult) {
          const parsed =
            JSON.parse(storedResult);

          if (
            parsed &&
            Array.isArray(parsed.skillResults) &&
            parsed.skillResults.length > 0
          ) {
            setHistoricalComparison(parsed);
          } else {
            setHistoricalComparison(null);
          }
        } else {
          setHistoricalComparison(null);
        }
      }

      // =====================================================
      // 4. HR-ALLOCATED MENTORS & EMPLOYEE MENTORSHIPS
      // =====================================================
      //
      // IMPORTANT:
      //
      // We intentionally DO NOT call:
      //
      // /api/mentorships/recommendations/{employeeId}
      //
      // because that endpoint dynamically finds possible
      // mentors based on skill proficiency.
      //
      // Employees must see ONLY mentors explicitly
      // allocated/recommended by HR.
      //
      // HR allocation endpoint:
      //
      // /api/mentor-allocations/employee/{employeeId}
      //
      // =====================================================

      try {
        const token =
          localStorage.getItem("token");

        const authHeaders = {
          headers: {
            Authorization: token
              ? `Bearer ${token}`
              : "",
          },
        };

        const [
          allocationsRes,
          mentorshipsRes,
        ] = await Promise.all([
          axios
            .get(
              `http://localhost:8080/api/mentor-allocations/employee/${employeeId}`,
              authHeaders
            )
            .catch(() => ({
              data: [],
            })),

          axios
            .get(
              `http://localhost:8080/api/mentorships/employee/${employeeId}`,
              authHeaders
            )
            .catch(() => ({
              data: [],
            })),
        ]);

        console.log(
          "HR Allocated Mentors:",
          allocationsRes.data
        );

        console.log(
          "My Mentorships:",
          mentorshipsRes.data
        );

        setMentorRecommendations(
          Array.isArray(
            allocationsRes.data
          )
            ? allocationsRes.data
            : []
        );

        setMyMentorships(
          Array.isArray(
            mentorshipsRes.data
          )
            ? mentorshipsRes.data
            : []
        );
      } catch (mentorshipErr) {
        console.error(
          "Employee mentorship data error:",
          mentorshipErr
        );

        setMentorRecommendations([]);
        setMyMentorships([]);
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
  // REQUEST HR-RECOMMENDED MENTOR
  // =========================================================

  const requestMentor = async (mentor) => {
    if (
      !mentor?.employeeId ||
      !mentor?.skillId
    ) {
      setMentorshipMessage(
        "Unable to send request. Mentor or skill information is missing."
      );

      return;
    }

    try {
      setRequestingMentorId(
        `${mentor.employeeId}-${mentor.skillId}`
      );

      setMentorshipMessage("");

      const token =
        localStorage.getItem("token");

      // =====================================================
      // CREATE MENTORSHIP REQUEST
      // =====================================================

      await axios.post(
        "http://localhost:8080/api/mentorships",
        null,
        {
          params: {
            menteeIdentifier: employeeId,
            mentorIdentifier:
              mentor.employeeId,
            skillId: mentor.skillId,
            goal: `Improve ${
              mentor.skillName ||
              "the required skill"
            }`,
          },

          headers: {
            Authorization: token
              ? `Bearer ${token}`
              : "",
          },
        }
      );

      // =====================================================
      // REFRESH HR ALLOCATIONS + MENTORSHIPS
      // =====================================================

      const authHeaders = {
        headers: {
          Authorization: token
            ? `Bearer ${token}`
            : "",
        },
      };

      const [
        allocationsRes,
        mentorshipsRes,
      ] = await Promise.all([
        axios.get(
          `http://localhost:8080/api/mentor-allocations/employee/${employeeId}`,
          authHeaders
        ),

        axios.get(
          `http://localhost:8080/api/mentorships/employee/${employeeId}`,
          authHeaders
        ),
      ]);

      setMentorRecommendations(
        Array.isArray(
          allocationsRes.data
        )
          ? allocationsRes.data
          : []
      );

      setMyMentorships(
        Array.isArray(
          mentorshipsRes.data
        )
          ? mentorshipsRes.data
          : []
      );

      setMentorshipMessage(
        "Mentorship request sent successfully. The mentor has been notified."
      );
    } catch (err) {
      console.error(
        "Mentor request error:",
        err
      );

      setMentorshipMessage(
        typeof err.response?.data ===
          "string"
          ? err.response.data
          : err.response?.data?.message ||
              "Unable to send mentorship request."
      );
    } finally {
      setRequestingMentorId(null);
    }
  };

  // =========================================================
  // MENTORSHIP STATUS HELPERS
  // =========================================================

  const getMentorshipStatusClass = (
    status
  ) => {
    switch (
      (status || "").toUpperCase()
    ) {
      case "REQUESTED":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";

      case "ACCEPTED":
        return "bg-blue-100 text-blue-700 border-blue-200";

      case "ACTIVE":
        return "bg-green-100 text-green-700 border-green-200";

      case "COMPLETED":
        return "bg-slate-100 text-slate-700 border-slate-200";

      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200";

      case "CANCELLED":
        return "bg-gray-100 text-gray-600 border-gray-200";

      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getMentorshipStatusLabel = (
    status
  ) => {
    const normalized =
      (status || "").toUpperCase();

    if (normalized === "REQUESTED")
      return "Requested";

    if (normalized === "ACCEPTED")
      return "Accepted";

    if (normalized === "ACTIVE")
      return "Active";

    if (normalized === "COMPLETED")
      return "Completed";

    if (normalized === "REJECTED")
      return "Rejected";

    if (normalized === "CANCELLED")
      return "Cancelled";

    return status || "Unknown";
  };

  // =========================================================
  // AVAILABLE HR-ALLOCATED MENTORS
  // =========================================================

  const availableMentorRecommendations =
    mentorRecommendations.filter(
      (recommendation) => {

        return !myMentorships.some(
          (mentorship) => {

            const sameMentor =
              mentorship.mentorIdentifier ===
              recommendation.employeeId;

            const sameSkill =
              Number(
                mentorship.skillId
              ) ===
              Number(
                recommendation.skillId
              );

            const status =
              mentorship.status?.toUpperCase();

            const alreadyRequested = [
              "REQUESTED",
              "ACCEPTED",
              "ACTIVE",
              "COMPLETED",
            ].includes(status);

            return (
              sameMentor &&
              sameSkill &&
              alreadyRequested
            );
          }
        );
      }
    );

  // =========================================================
  // MENTORSHIPS BY STATUS
  // =========================================================

  const mentorshipsByStatus = (
    status
  ) =>
    myMentorships.filter(
      (mentorship) =>
        mentorship.status?.toUpperCase() ===
        status
    );

  // =========================================================
  // AVERAGE SKILL LEVEL
  // =========================================================

  const calculateAverageLevel = () => {

    if (skills.length === 0) {
      return 0;
    }

    const totalLevel =
      skills.reduce(
        (total, item) =>
          total +
          Number(
            item.currentLevel || 0
          ),
        0
      );

    return (
      totalLevel / skills.length
    );
  };

  const averageLevel =
    calculateAverageLevel();

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

  const getMatchingGap = (
    skillName
  ) => {

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

    const backendRequiredLevel =
      Number(
        matchingGap.requiredLevel || 0
      );

    if (backendRequiredLevel > 0) {
      return Math.min(
        Math.max(
          backendRequiredLevel,
          1
        ),
        5
      );
    }

    const backendGap =
      Number(
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

    if (
      !skills ||
      skills.length === 0
    ) {
      return [];
    }

    const actualGaps = [];

    skills.forEach((skill) => {

      const skillName =
        getSkillName(skill);

      if (!skillName) {
        return;
      }

      const currentLevel =
        Number(
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

  const getGapSeverity = (
    gap
  ) => {

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
              MY MENTORSHIPS
          ================================================= */}

          <div className="bg-white rounded-2xl shadow-lg p-6 mt-8 border border-slate-100">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">

              <div>

                <div className="flex items-center gap-2">

                  <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">

                    <UserCheck size={19} />

                  </div>

                  <h2 className="text-2xl font-bold text-slate-800">
                    My Mentorships
                  </h2>

                </div>

                <p className="text-gray-500 mt-1 text-sm">
                  View HR-recommended mentors and track your mentorship requests.
                </p>

              </div>

              {myMentorships.length > 0 && (
                <div className="text-sm text-slate-500">

                  {myMentorships.length} mentorship
                  {myMentorships.length !== 1
                    ? "s"
                    : ""}

                </div>
              )}

            </div>

            {/* =================================================
                SUCCESS / ERROR MESSAGE
            ================================================= */}

            {mentorshipMessage && (
              <div
                className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
                  mentorshipMessage
                    .toLowerCase()
                    .includes("success")
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {mentorshipMessage}
              </div>
            )}

            {/* =================================================
                HR ALLOCATED MENTOR RECOMMENDATIONS
            ================================================= */}

            <div className="mb-8">

              <div className="flex items-center justify-between mb-4">

                <div>

                  <h3 className="text-lg font-bold text-slate-800">
                    Mentor Recommendations
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Mentors specifically recommended for you by HR.
                  </p>

                </div>

                {availableMentorRecommendations.length > 0 && (
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">

                    {availableMentorRecommendations.length}{" "}
                    Available

                  </span>
                )}

              </div>

              {availableMentorRecommendations.length ===
              0 ? (

                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">

                  <UserCheck
                    size={38}
                    className="text-slate-400 mx-auto mb-3"
                  />

                  <p className="text-sm font-semibold text-slate-700">
                    No HR mentor recommendations available
                  </p>

                  <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
                    HR-recommended mentors will appear here when a mentor is allocated to you for one of your skill gaps.
                  </p>

                </div>

              ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {availableMentorRecommendations.map(
                    (mentor, index) => {

                      const recommendationKey =
                        `${mentor.employeeId}-${mentor.skillId}`;

                      const isRequesting =
                        requestingMentorId ===
                        recommendationKey;

                      return (
                        <div
                          key={
                            mentor.id ||
                            recommendationKey ||
                            index
                          }
                          className="border border-indigo-100 rounded-xl p-5 bg-indigo-50/40 hover:bg-white hover:shadow-md transition"
                        >

                          {/* MENTOR HEADER */}

                          <div className="flex items-start justify-between gap-4">

                            <div className="flex items-start gap-3">

                              <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">

                                <UserCheck size={20} />

                              </div>

                              <div>

                                <h4 className="font-bold text-slate-900">

                                  {[
                                    mentor.firstName,
                                    mentor.lastName,
                                  ]
                                    .filter(Boolean)
                                    .join(" ") ||
                                    mentor.employeeId ||
                                    "Recommended Mentor"}

                                </h4>

                                <p className="text-xs text-slate-500 mt-1">
                                  {mentor.designation ||
                                    "Mentor"}
                                </p>

                              </div>

                            </div>

                            <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[11px] font-bold whitespace-nowrap">

                              Level{" "}
                              {mentor.mentorLevel ??
                                "N/A"}

                            </span>

                          </div>

                          {/* RECOMMENDED SKILL */}

                          <div className="mt-4 rounded-lg bg-white border border-slate-100 p-3">

                            <p className="text-xs text-slate-500">
                              Recommended for skill
                            </p>

                            <p className="font-semibold text-slate-800 mt-1">

                              {mentor.skillName ||
                                "Required Skill"}

                            </p>

                          </div>

                          {/* EMAIL + REQUEST */}

                          <div className="mt-4 flex items-center justify-between gap-3">

                            <p className="text-xs text-slate-500 truncate">
                              {mentor.email || ""}
                            </p>

                            <button
                              onClick={() =>
                                requestMentor(
                                  mentor
                                )
                              }
                              disabled={
                                isRequesting
                              }
                              className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition shadow-sm whitespace-nowrap ${
                                isRequesting
                                  ? "bg-slate-400 cursor-not-allowed"
                                  : "bg-indigo-600 hover:bg-indigo-700"
                              }`}
                            >

                              {isRequesting
                                ? "Sending..."
                                : "Request Mentor"}

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
                MENTORSHIP STATUS
            ================================================= */}

            <div className="border-t border-slate-100 pt-7">

              <div className="flex items-center justify-between mb-5">

                <div>

                  <h3 className="text-lg font-bold text-slate-800">
                    My Mentorship Status
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Track your mentorship journey from request to completion.
                  </p>

                </div>

              </div>

              {myMentorships.length === 0 ? (

                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">

                  <p className="text-sm font-semibold text-slate-700">
                    No mentorships yet
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Request one of the HR-recommended mentors above to start your mentorship journey.
                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  {[
                    "REQUESTED",
                    "ACCEPTED",
                    "ACTIVE",
                    "COMPLETED",
                  ].map((status) => {

                    const mentorships =
                      mentorshipsByStatus(
                        status
                      );

                    return (
                      <div
                        key={status}
                        className="rounded-xl border border-slate-200 p-4"
                      >

                        <div className="flex items-center justify-between mb-3">

                          <h4 className="font-semibold text-slate-800">
                            {getMentorshipStatusLabel(
                              status
                            )}
                          </h4>

                          <span
                            className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${getMentorshipStatusClass(
                              status
                            )}`}
                          >
                            {mentorships.length}
                          </span>

                        </div>

                        {mentorships.length ===
                        0 ? (

                          <p className="text-xs text-slate-400">

                            No{" "}

                            {getMentorshipStatusLabel(
                              status
                            ).toLowerCase()}{" "}

                            mentorships.

                          </p>

                        ) : (

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                            {mentorships.map(
                              (mentorship) => (

                                <div
                                  key={
                                    mentorship.id
                                  }
                                  className="bg-slate-50 rounded-lg border border-slate-100 p-4"
                                >

                                  <div className="flex items-start justify-between gap-3">

                                    <div>

                                      <p className="text-xs text-slate-500">
                                        Mentor
                                      </p>

                                      <p className="font-semibold text-slate-800 mt-1">

                                        {mentorship.mentorName ||
                                          mentorship.mentorIdentifier ||
                                          "Mentor"}

                                      </p>

                                    </div>

                                    <span
                                      className={`px-2 py-1 rounded-full border text-[10px] font-bold whitespace-nowrap ${getMentorshipStatusClass(
                                        mentorship.status
                                      )}`}
                                    >

                                      {getMentorshipStatusLabel(
                                        mentorship.status
                                      )}

                                    </span>

                                  </div>

                                  <div className="mt-3">

                                    <p className="text-xs text-slate-500">
                                      Skill
                                    </p>

                                    <p className="text-sm font-semibold text-indigo-700 mt-1">

                                      {mentorship.skillName ||
                                        "Skill"}

                                    </p>

                                  </div>

                                  {mentorship.goal && (
                                    <div className="mt-3">

                                      <p className="text-xs text-slate-500">
                                        Goal
                                      </p>

                                      <p className="text-xs text-slate-600 mt-1">
                                        {mentorship.goal}
                                      </p>

                                    </div>
                                  )}

                                  <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-500">

                                    {mentorship.startDate && (
                                      <span>

                                        Started:{" "}

                                        {new Date(
                                          mentorship.startDate
                                        ).toLocaleDateString()}

                                      </span>
                                    )}

                                    {mentorship.endDate && (
                                      <span>

                                        Completed:{" "}

                                        {new Date(
                                          mentorship.endDate
                                        ).toLocaleDateString()}

                                      </span>
                                    )}

                                  </div>

                                </div>
                              )
                            )}

                          </div>
                        )}

                      </div>
                    );
                  })}

                </div>
              )}

              {/* REJECTED / CANCELLED HISTORY */}

              {(
                mentorshipsByStatus(
                  "REJECTED"
                ).length > 0 ||
                mentorshipsByStatus(
                  "CANCELLED"
                ).length > 0
              ) && (

                <div className="mt-4 border-t border-slate-100 pt-4">

                  <p className="text-xs font-semibold text-slate-500 mb-3">
                    Other Mentorship History
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {[
                      ...mentorshipsByStatus(
                        "REJECTED"
                      ),
                      ...mentorshipsByStatus(
                        "CANCELLED"
                      ),
                    ].map((mentorship) => (

                      <span
                        key={
                          mentorship.id
                        }
                        className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${getMentorshipStatusClass(
                          mentorship.status
                        )}`}
                      >

                        {mentorship.mentorName ||
                          mentorship.mentorIdentifier ||
                          "Mentor"}

                        {" — "}

                        {getMentorshipStatusLabel(
                          mentorship.status
                        )}

                      </span>

                    ))}

                  </div>

                </div>
              )}

            </div>

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

                {skills.map(
                  (item, index) => {

                    const skillName =
                      getSkillName(item) ||
                      "Unknown Skill";

                    const currentLevel =
                      Number(
                        item.currentLevel ||
                          0
                      );

                    const matchingGap =
                      getMatchingGap(
                        skillName
                      );

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
                      getGapSeverity(
                        skillGap
                      );

                    const currentPercentage =
                      Math.round(
                        (currentLevel / 5) *
                          100
                      );

                    const requiredPercentage =
                      Math.round(
                        (requiredLevel / 5) *
                          100
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
                        key={
                          item.id ||
                          index
                        }
                        className={`border ${severity.border} rounded-xl p-5`}
                      >

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
                                skillGap !==
                                1
                                  ? "s"
                                  : ""
                              }`}
                          </div>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

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

                              {
                                levelNames[
                                  currentLevel
                                ] ||
                                "Not Rated"
                              }

                            </p>

                          </div>

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

                              {
                                levelNames[
                                  requiredLevel
                                ] ||
                                "Not Defined"
                              }

                            </p>

                          </div>

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
                                {skillGap !==
                                1
                                  ? "s"
                                  : ""}
                              </span>

                            </p>

                            <p className="text-xs mt-1">

                              {skillGap ===
                              0
                                ? "Requirement achieved"
                                : "Needs improvement"}

                            </p>

                          </div>

                        </div>

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
                                  levelStyles[
                                    cell
                                  ];

                                let cellClass =
                                  "bg-slate-100 text-slate-400 border border-slate-200";

                                if (
                                  isCurrent
                                ) {

                                  cellClass =
                                    `${style.solid} border-2 border-transparent shadow-md`;
                                }

                                if (
                                  isGap
                                ) {

                                  cellClass =
                                    `${style.faded} shadow-inner`;
                                }

                                return (
                                  <div
                                    key={
                                      cell
                                    }
                                    className={`h-16 rounded-lg flex flex-col items-center justify-center ${cellClass}`}
                                  >

                                    <span className="font-bold text-lg">
                                      {cell}
                                    </span>

                                    <span className="text-[10px] mt-1">

                                      {
                                        levelNames[
                                          cell
                                        ]
                                      }

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

                        <div className="mt-6">

                          <div className="flex justify-between text-xs text-gray-500 mb-2">

                            <span>
                              Skill achievement
                            </span>

                            <span>

                              Current{" "}
                              {currentPercentage}%

                              {" / "}

                              Required{" "}
                              {requiredPercentage}%

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
                  }
                )}

              </div>
            )}

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

            {!historicalComparison ||
            !Array.isArray(
              historicalComparison.skillResults
            ) ||
            historicalComparison.skillResults.length ===
              0 ? (

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

                  <div className="bg-indigo-50 rounded-xl p-5">

                    <p className="text-sm text-indigo-600 font-medium">
                      Latest Overall Score
                    </p>

                    <p className="text-3xl font-bold text-indigo-700 mt-2">

                      {Number(
                        historicalComparison.overallScore ||
                          0
                      ).toFixed(1)}

                      %

                    </p>

                  </div>

                  <div className="bg-green-50 rounded-xl p-5">

                    <p className="text-sm text-green-600 font-medium">
                      Performance Level
                    </p>

                    <p className="text-2xl font-bold text-green-700 mt-3">

                      {historicalComparison.performanceLevel ||
                        "Calculated"}

                    </p>

                  </div>

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
                              skill.improvement ||
                                0
                            );

                          const remainingGap =
                            Number(
                              skill.remainingGap ||
                                0
                            );

                          return (
                            <tr
                              key={
                                skill.skillName ||
                                index
                              }
                              className="border-b border-slate-100 hover:bg-slate-50"
                            >

                              <td className="py-4 px-4">

                                <span className="font-semibold text-slate-800">
                                  {skill.skillName ||
                                    "Unknown Skill"}
                                </span>

                              </td>

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
                                      {
                                        skill.previousLevel
                                      }{" "}
                                      / 5

                                    </span>
                                  )}

                                </div>

                              </td>

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
                                      {
                                        skill.currentLevel
                                      }{" "}
                                      / 5

                                    </span>
                                  )}

                                </div>

                              </td>

                              <td className="py-4 px-4 text-center">

                                {improvement >
                                0 ? (

                                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-semibold text-sm">

                                    <ArrowUp
                                      size={15}
                                    />

                                    +{improvement}

                                  </span>

                                ) : improvement <
                                  0 ? (

                                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-100 text-red-700 font-semibold text-sm">

                                    <ArrowDown
                                      size={15}
                                    />

                                    {improvement}

                                  </span>

                                ) : (

                                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-sm">

                                    <Minus
                                      size={15}
                                    />

                                    0

                                  </span>

                                )}

                              </td>

                              <td className="py-4 px-4 text-center">

                                {remainingGap ===
                                0 ? (

                                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                                    No Gap
                                  </span>

                                ) : (

                                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm">

                                    {remainingGap}{" "}

                                    {remainingGap ===
                                    1
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

            {knowledgeGapCount ===
            0 ? (

              <p className="text-green-600">
                You have no major knowledge gaps.
              </p>

            ) : (

              <div className="space-y-4">

                {actualKnowledgeGaps
                  .slice(0, 4)
                  .map(
                    (gap, index) => {

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
                            Learn{" "}
                            {skillName}
                          </span>

                        </div>
                      );
                    }
                  )}

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