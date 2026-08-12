import { useState, useEffect } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function CompetencyFramework() {
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [competencies, setCompetencies] = useState([]);
  const [role, setRole] = useState("Java Developer");
  const [requiredLevel, setRequiredLevel] = useState(70);
  const getLevelName = (level) => {
  switch(level) {
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
  const fetchCompetencies = async (designation) => {
  try {
    const response = await api.get(
  `/competencies/designation/${designation}`
    );

    setCompetencies(
  response.data.map((item) => ({
    id: item.id,
    skillName: item.skill.skillName,
    requiredLevel: item.requiredLevel,
  }))
);
  } catch (error) {
    console.error(error);
    setCompetencies([]);
  }
};
  const fetchSkills = async () => {
  try {
    const response = await api.get("/skills");
    setSkills(response.data);
  } catch (error) {
    console.error(error);
  }
  };
  useEffect(() => {
  fetchCompetencies(role);
  fetchSkills();
}, [role]);

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
      requiredLevel: Math.round(requiredLevel / 20),
      description: "",
    });

    alert("Competency added successfully!");

    fetchCompetencies(role);

    setSelectedSkill("");
    setRequiredLevel(70);

  } catch (error) {
    console.error(error);
    alert("Failed to add competency.");
  }
};
  
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar role="HR" />

      <div className="flex-1">
        <Navbar title="Competency Framework" />

        <div className="p-8">
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-2xl font-bold mb-3">Competency Framework</h2>
            <p className="text-gray-500">
              HR can define required skills and proficiency levels for a role. These competencies are used to detect employee gaps.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
              <div className="flex flex-col gap-4 mb-6">
                <div>
                  <label className="block mb-2 font-medium">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600"
>
                    <option>Java Developer</option>
                    <option>Frontend Developer</option>
                    <option>Data Analyst</option>
                    <option>Software Engineer</option>
                  </select>
                </div>
                <p className="text-sm text-gray-600">
                  The competencies defined here represent the target skills and proficiency levels required for the selected role.
                </p>
              </div>

              <div className="space-y-4">
                {competencies.map((competency) => (
                  <div key={competency.id} className="border rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">{competency.skillName}</h3>
                        <p className="text-sm text-gray-500">Role target</p>
                      </div>
                      <span className="text-indigo-600 font-semibold">{competency.requiredLevel}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-indigo-600 h-3 rounded-full" style={{width: `${competency.requiredLevel}*20%`}} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Add Required Skill</h3>
              <form onSubmit={addCompetency} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Skill Name</label>
                  <select
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="">Select Skill</option>

                    {skills.map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.skillName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Required Proficiency</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={Math.round(requiredLevel / 20)}
                    onChange={(e) => setRequiredLevel(Number(e.target.value) * 20)}
                    className="w-full"
                  />
                <div className="mt-2 text-sm text-gray-600">{getLevelName(Math.round(requiredLevel / 20))}%</div>
                </div>
                <button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition">
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
