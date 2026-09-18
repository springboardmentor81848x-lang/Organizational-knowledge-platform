import { useState, useEffect } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function CompetencyFramework() {
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [competencies, setCompetencies] = useState([]);

  // =========================================================
  // TARGET ROLES
  // These match the Assessment Role table
  // =========================================================

  const roles = [
    "Software Developer",
    "Software Tester",
    "Data Analyst",
    "Data Scientist",
    "DevOps Engineer",
    "UI/UX Designer",
    "Cybersecurity Analyst",
    "Database Administrator",
  ];

  const [role, setRole] = useState("Software Developer");

  // Store required level as 1-5
  const [requiredLevel, setRequiredLevel] = useState(3);

  // =========================================================
  // PROFICIENCY LEVEL NAMES
  // =========================================================

  const getLevelName = (level) => {
    switch (Number(level)) {
      case 1:
        return "Beginner";
      case 2:
        return "Basic";
      case 3:
        return "Intermediate";
      case 4:
        return "Advanced";
      case 5:
        return "Expert";
      default:
        return "Unknown";
    }
  };

  // =========================================================
  // CONVERT LEVEL TO PERCENTAGE
  // =========================================================

  const getLevelPercentage = (level) => {
    return Number(level) * 20;
  };

  // =========================================================
  // FETCH COMPETENCIES FOR SELECTED ROLE
  // =========================================================

  const fetchCompetencies = async (designation) => {
    try {
      const response = await api.get(
        `/competencies/designation/${encodeURIComponent(designation)}`
      );

      setCompetencies(
        response.data.map((item) => ({
          id: item.id,
          skillName: item.skill?.skillName || "Unknown Skill",
          requiredLevel: item.requiredLevel,
          description: item.description || "",
        }))
      );
    } catch (error) {
      console.error("Error fetching competencies:", error);
      setCompetencies([]);
    }
  };

  // =========================================================
  // FETCH SKILLS
  // =========================================================

  const fetchSkills = async () => {
    try {
      const response = await api.get("/skills");
      setSkills(response.data);
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    fetchCompetencies(role);
    fetchSkills();
  }, [role]);

  // =========================================================
  // ADD COMPETENCY
  // =========================================================

  const addCompetency = async (e) => {
    e.preventDefault();

    if (!selectedSkill) {
      alert("Please select a skill.");
      return;
    }

    try {
      await api.post("/competencies", {
        designation: role,

        skill: {
          id: Number(selectedSkill),
        },

        requiredLevel: requiredLevel,

        description: `${getLevelName(requiredLevel)} level required for ${role}`,
      });

      alert("Competency added successfully!");

      // Refresh competencies
      await fetchCompetencies(role);

      // Reset form
      setSelectedSkill("");
      setRequiredLevel(3);
    } catch (error) {
      console.error("Error adding competency:", error);

      alert(
        error.response?.data?.message ||
          "Failed to add competency."
      );
    }
  };

  // =========================================================
  // DELETE COMPETENCY
  // =========================================================

  const deleteCompetency = async (id) => {
    if (!window.confirm("Are you sure you want to delete this competency?")) {
      return;
    }

    try {
      await api.delete(`/competencies/${id}`);

      alert("Competency deleted successfully!");

      fetchCompetencies(role);
    } catch (error) {
      console.error("Error deleting competency:", error);
      alert("Failed to delete competency.");
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar role="HR" />

      <div className="flex-1">
        <Navbar title="Competency Framework" />

        <div className="p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-2xl font-bold mb-3">
              Competency Framework
            </h2>

            <p className="text-gray-500">
              HR can define the required skills and proficiency
              levels for each target role. These competencies are
              used to identify employee knowledge gaps.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* =================================================
                EXISTING COMPETENCIES
            ================================================= */}

            <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">

              {/* Role Selection */}

              <div className="flex flex-col gap-4 mb-6">

                <div>
                  <label className="block mb-2 font-medium">
                    Target Role
                  </label>

                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    {roles.map((roleName) => (
                      <option
                        key={roleName}
                        value={roleName}
                      >
                        {roleName}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-sm text-gray-600">
                  The competencies below represent the skills and
                  proficiency levels required for the selected target
                  role.
                </p>
              </div>

              {/* Competency List */}

              <div className="space-y-4">

                {competencies.length === 0 ? (
                  <div className="border rounded-xl p-6 text-center text-gray-500">
                    No competencies defined for{" "}
                    <span className="font-semibold">
                      {role}
                    </span>
                    .
                  </div>
                ) : (
                  competencies.map((competency) => (
                    <div
                      key={competency.id}
                      className="border rounded-xl p-4"
                    >
                      <div className="flex justify-between items-center mb-3">

                        <div>
                          <h3 className="text-lg font-semibold">
                            {competency.skillName}
                          </h3>

                          <p className="text-sm text-gray-500">
                            Required proficiency:{" "}
                            {getLevelName(
                              competency.requiredLevel
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">

                          <span className="text-indigo-600 font-semibold">
                            {getLevelPercentage(
                              competency.requiredLevel
                            )}
                            %
                          </span>

                          <button
                            onClick={() =>
                              deleteCompetency(competency.id)
                            }
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>

                        </div>
                      </div>

                      {/* Progress Bar */}

                      <div className="w-full bg-gray-200 rounded-full h-3">

                        <div
                          className="bg-indigo-600 h-3 rounded-full"
                          style={{
                            width: `${getLevelPercentage(
                              competency.requiredLevel
                            )}%`,
                          }}
                        />

                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        Level {competency.requiredLevel} / 5
                      </div>

                    </div>
                  ))
                )}

              </div>
            </div>

            {/* =================================================
                ADD REQUIRED SKILL
            ================================================= */}

            <div className="bg-white rounded-xl shadow p-6">

              <h3 className="text-lg font-semibold mb-4">
                Add Required Skill
              </h3>

              <form
                onSubmit={addCompetency}
                className="space-y-4"
              >

                {/* Target Role */}

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Target Role
                  </label>

                  <input
                    type="text"
                    value={role}
                    disabled
                    className="w-full border rounded-lg px-4 py-3 bg-gray-100 text-gray-600"
                  />
                </div>

                {/* Skill */}

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Skill Name
                  </label>

                  <select
                    value={selectedSkill}
                    onChange={(e) =>
                      setSelectedSkill(e.target.value)
                    }
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >

                    <option value="">
                      Select Skill
                    </option>

                    {skills.map((skill) => (
                      <option
                        key={skill.id}
                        value={skill.id}
                      >
                        {skill.skillName}
                      </option>
                    ))}

                  </select>
                </div>

                {/* Required Proficiency */}

                <div>

                  <label className="block mb-2 text-sm font-medium">
                    Required Proficiency
                  </label>

                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={requiredLevel}
                    onChange={(e) =>
                      setRequiredLevel(
                        Number(e.target.value)
                      )
                    }
                    className="w-full"
                  />

                  <div className="mt-2 flex justify-between text-sm">

                    <span className="text-gray-500">
                      Level {requiredLevel}/5
                    </span>

                    <span className="font-semibold text-indigo-600">
                      {getLevelName(requiredLevel)}
                    </span>

                  </div>

                </div>

                {/* Add Button */}

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
                >
                  Add Required Skill
                </button>

              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default CompetencyFramework;