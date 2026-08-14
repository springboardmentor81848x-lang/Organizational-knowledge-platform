import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  detectGaps,
  getKnowledgeGapsByEmployee,
} from "../services/platformService";

function KnowledgeGap() {
  const [gaps, setGaps] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const employeeId = localStorage.getItem("employeeId");
  const token = localStorage.getItem("token");

  const userRole =
    (localStorage.getItem("role") || "EMPLOYEE").toUpperCase();

  const userName = [
    localStorage.getItem("firstName"),
    localStorage.getItem("lastName"),
  ]
    .filter(Boolean)
    .join(" ");

  const roleDescriptions = {
    EMPLOYEE:
      "Knowledge gap analysis compares your assessment performance with the required competencies for your selected target role.",

    HR:
      "HR gap analysis helps identify competency shortages across employees.",

    MANAGER:
      "Manager gap analysis reveals team-level skill gaps.",

    ADMIN:
      "Knowledge gap analysis provides an organizational view of skill deficiencies.",
  };

  const gapDescription =
    roleDescriptions[userRole] ||
    "Knowledge gap analysis compares assessment performance with required competencies and identifies areas for improvement.";

  // =========================================================
  // LOAD STORED KNOWLEDGE GAPS
  // =========================================================

  const loadData = async () => {
    if (!employeeId) {
      setError("Employee ID is not available. Please login again.");
      setLoadingData(false);
      return;
    }

    try {
      setLoadingData(true);
      setError("");

      // Only load previously stored knowledge gaps.
      // No Skill Inventory is loaded here.
      const gapResponse =
        await getKnowledgeGapsByEmployee(employeeId);

      setGaps(gapResponse.data || []);
    } catch (err) {
      console.error(
        "Knowledge Gap loading error:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      setError(
        "Unable to load your knowledge gap data."
      );
    } finally {
      setLoadingData(false);
    }
  };

  // =========================================================
  // RUN GAP DETECTION
  // =========================================================

  const runGapAnalysis = async () => {
    if (!employeeId) {
      setError(
        "Employee ID is not available."
      );
      return;
    }

    if (!token) {
      setError(
        "Authentication token is not available. Please login again."
      );
      return;
    }

    try {
      setError("");
      setSuccessMessage("");
      setLoading(true);

      console.log(
        "Running assessment-based gap detection for:",
        employeeId
      );

      const response =
        await detectGaps(employeeId);

      const gapResults =
        response.data || [];

      setGaps(gapResults);

      setSuccessMessage(
        `Knowledge gap analysis completed for ${
          userName || "your account"
        }. ${gapResults.length} gap(s) identified.`
      );

    } catch (err) {
      console.error(
        "Gap detection error:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      console.error(
        "Backend status:",
        err.response?.status
      );

      if (err.response?.status === 404) {
        setError(
          "Employee or assessment data not found. Please complete an assessment first."
        );
      } else if (err.response?.status === 500) {
        setError(
          "Gap detection failed on the server. Please check the backend console for the exact error."
        );
      } else {
        setError(
          "Unable to run knowledge gap analysis."
        );
      }

      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // HELPER
  // =========================================================

  const getSkillName = (item) => {
    return (
      item?.skill?.skillName ||
      item?.skillName ||
      "Unknown Skill"
    );
  };

  // =========================================================
  // GAP STATUS
  // =========================================================

  const getGapStatus = (gapValue) => {
    if (gapValue >= 4) {
      return "Critical";
    }

    if (gapValue === 3) {
      return "High";
    }

    if (gapValue === 2) {
      return "Medium";
    }

    if (gapValue === 1) {
      return "Low";
    }

    return "No Gap";
  };

  const getStatusClass = (gapValue) => {
    if (gapValue >= 4) {
      return "bg-red-100 text-red-700";
    }

    if (gapValue === 3) {
      return "bg-orange-100 text-orange-700";
    }

    if (gapValue === 2) {
      return "bg-yellow-100 text-yellow-700";
    }

    if (gapValue === 1) {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-green-100 text-green-700";
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="flex bg-gray-100 min-h-screen">

      <Sidebar
        role={
          localStorage.getItem("role") ||
          "EMPLOYEE"
        }
      />

      <div className="flex-1">

        <Navbar title="Knowledge Gap Analysis" />

        <div className="p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="bg-white rounded-xl shadow p-6 mb-8">

            <h2 className="text-2xl font-bold mb-3">
              Knowledge Gap Analysis
            </h2>

            <p className="text-gray-500 mb-6">
              {gapDescription}
            </p>

            <div className="border rounded-xl p-4">

              <h3 className="font-semibold mb-2">
                Employee
              </h3>

              <p>
                {userName || "Employee user"}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Employee ID:{" "}
                {employeeId || "Not available"}
              </p>

            </div>

            {/* =================================================
                BUTTON
            ================================================= */}

            <div className="mt-6">

              <button
                onClick={runGapAnalysis}
                disabled={
                  loading ||
                  !employeeId ||
                  !token
                }
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Analyzing assessment..."
                  : "Run Gap Detection"}
              </button>

            </div>

            {!employeeId && (
              <p className="mt-3 text-sm text-red-600">
                Employee ID is missing. Please login again.
              </p>
            )}

            {error && (
              <p className="mt-4 text-sm text-red-600">
                {error}
              </p>
            )}

            {successMessage && (
              <p className="mt-4 text-sm text-green-600">
                {successMessage}
              </p>
            )}

          </div>

          {/* =================================================
              STORED ASSESSMENT-BASED GAPS
          ================================================= */}

          <div>

            <div className="flex justify-between items-center mb-4">

              <div>
                <h3 className="text-xl font-semibold">
                  Detected Knowledge Gaps
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Based on your latest assessment and selected target role.
                </p>
              </div>

              {gaps.length > 0 && (
                <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium">
                  {gaps.length} Gap
                  {gaps.length !== 1 ? "s" : ""}
                </span>
              )}

            </div>

            {loadingData ? (

              <div className="bg-white rounded-xl shadow p-6">
                <p className="text-gray-500">
                  Loading knowledge gaps...
                </p>
              </div>

            ) : gaps.length === 0 ? (

              <div className="bg-white rounded-xl shadow p-6 text-gray-600">

                <p>
                  No knowledge gaps found.
                </p>

                <p className="text-sm mt-2">
                  Complete your role-specific assessment first,
                  then click <b>Run Gap Detection</b>.
                </p>

              </div>

            ) : (

              <div className="grid md:grid-cols-2 gap-6">

                {gaps.map(
                  (gap, index) => {

                    const skillName =
                      getSkillName(gap);

                    const currentLevel =
                      gap.currentLevel ?? 0;

                    const requiredLevel =
                      gap.requiredLevel ?? 0;

                    const gapValue =
                      gap.gap ?? 0;

                    const status =
                      getGapStatus(gapValue);

                    return (

                      <div
                        key={
                          gap.id || index
                        }
                        className="bg-white rounded-xl shadow p-6"
                      >

                        <div className="flex justify-between items-start mb-4">

                          <h4 className="text-lg font-semibold">
                            {skillName}
                          </h4>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                              gapValue
                            )}`}
                          >
                            {status}
                          </span>

                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-4">

                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">
                              Assessment Level
                            </p>

                            <p className="text-lg font-bold">
                              {currentLevel}
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500">
                              Required Level
                            </p>

                            <p className="text-lg font-bold">
                              {requiredLevel}
                            </p>
                          </div>

                          <div className="bg-red-50 rounded-lg p-3">
                            <p className="text-xs text-red-500">
                              Gap
                            </p>

                            <p className="text-lg font-bold text-red-600">
                              {gapValue}
                            </p>
                          </div>

                        </div>

                        <p className="text-sm text-gray-700">
                          Recommendation: Focus on improving{" "}
                          <b>{skillName}</b> to reach the required
                          competency level for your selected role.
                        </p>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default KnowledgeGap;