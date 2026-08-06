import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  detectGaps,
  getCompetenciesByDesignation,
  getEmployeeSkills,
} from "../services/platformService";

function KnowledgeGap() {
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const employeeId = localStorage.getItem("employeeId");
  const token = localStorage.getItem("token");
  const designation =
  localStorage.getItem("designation") || "Not Assigned";
  const userRole = (localStorage.getItem("role") || "EMPLOYEE").toUpperCase();
  const userName = [
    localStorage.getItem("firstName"),
    localStorage.getItem("lastName"),
  ]
    .filter(Boolean)
    .join(" ");

  

  const roleDescriptions = {
    EMPLOYEE:
      "Employee gap analysis identifies your personal skill deficiencies against the required competencies for your role.",
    HR:
      "HR gap analysis helps uncover organizational competency shortages and alignment issues across roles.",
    MANAGER:
      "Manager gap analysis reveals team-level skill gaps so you can coach and assign the right work.",
    ADMIN:
      "Admin gap analysis provides a strategic view of skills across the organization for planning and training.",
  };

  const gapDescription = roleDescriptions[userRole] ||
    "Knowledge gap analysis compares current skills to required competencies and highlights missing skills or low proficiency levels.";

  const [requiredSkills, setRequiredSkills] = useState([]);

  const [currentSkills, setCurrentSkills] = useState([]);
  const runGapAnalysis = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await detectGaps(employeeId);
      const gapResults = response.data || [];
      setGaps(gapResults);
      setSuccessMessage(`Gap detection completed for ${userName || "your account"}. ${gapResults.length} gap(s) identified.`);
      setError("");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setError("Employee not found. Please confirm your login and employee ID.");
      } else {
        setError("Unable to run gap detection. Ensure backend is available and an employee ID is set.");
      }
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {

    const competencyResponse =
      await getCompetenciesByDesignation(designation);

    setRequiredSkills(competencyResponse.data);

    const skillResponse =
      await getEmployeeSkills(employeeId);

    setCurrentSkills(skillResponse.data);

  } catch (err) {
    console.error(err);
  }
};
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar role={(localStorage.getItem("role") || "EMPLOYEE")} />

      <div className="flex-1">
        <Navbar title="Knowledge Gap Analysis" />

        <div className="p-8">
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-2xl font-bold mb-3">Knowledge Gap Analysis</h2>
            <p className="text-gray-500 mb-4">
              {gapDescription}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-xl p-4">
                <h3 className="font-semibold mb-3">Designation</h3>
                <p>{designation}</p>
                
              </div>
              <div className="border rounded-xl p-4">
                <h3 className="font-semibold mb-3">Employee</h3>
                <p>{userName || "Employee user"}</p>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={runGapAnalysis}
                disabled={loading || !employeeId || !token}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Analyzing gaps..." : "Run Gap Detection"}
              </button>
              {(!employeeId || !token) && (
                <p className="mt-3 text-sm text-red-600">
                  Please log in so your authentication token and employee ID are available for gap detection.
                </p>
              )}
            </div>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            {successMessage && <p className="mt-4 text-sm text-green-600">{successMessage}</p>}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-semibold mb-4">Required Competencies</h3>
              <div className="space-y-4">
                {requiredSkills.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{item.skill.skillName}</span>
                      <span className="text-sm text-gray-500">Target: {item.requiredLevel}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-indigo-600 h-3 rounded-full" style={{ width: `${item.requiredLevel}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-semibold mb-4">Current Skill Inventory</h3>
              <div className="space-y-4">
                {currentSkills.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{item.skill.skillName}</span>
                      <span className="text-sm text-gray-500">Current: {item.currentLevel}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-green-600 h-3 rounded-full" style={{ width: `${item.currentLevel}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Detected Gaps</h3>
            {gaps.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-6 text-gray-600">
                No gaps have been stored yet. Run the gap detection to compare current skills with required competencies.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {gaps.map((gap, index) => {
                  const skillName = gap.skill?.skillName || gap.skill || gap.skillName || "Unknown Skill";
                  const currentLevel = gap.currentLevel ?? (gap.currentLevel === 0 ? 0 : 0);
                  const requiredLevel = gap.requiredLevel ?? 0;
                  const gapValue = gap.gap ?? 0;

                  return (
                    <div key={gap.id ?? index} className="bg-white rounded-xl shadow p-6">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-lg font-semibold">{skillName}</h4>
                        <span className="text-sm text-red-600">Gap: {gapValue}%</span>
                      </div>
                      <p className="text-sm text-gray-500">Current: {currentLevel}%</p>
                      <p className="text-sm text-gray-500">Required: {requiredLevel}%</p>
                      <p className="mt-4 text-sm text-gray-700">
                        Recommendation: Focus on improving this skill to meet the role requirement.
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default KnowledgeGap;
