import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function CompetencyFramework() {
  const [role, setRole] = useState("Java Developer");
  const [skillName, setSkillName] = useState("");
  const [requiredLevel, setRequiredLevel] = useState(70);
  const [competencies, setCompetencies] = useState([
    { skillName: "Java", requiredLevel: 90 },
    { skillName: "Spring Boot", requiredLevel: 80 },
    { skillName: "SQL", requiredLevel: 75 },
  ]);

  const addCompetency = (e) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    setCompetencies([
      ...competencies,
      { skillName: skillName.trim(), requiredLevel },
    ]);
    setSkillName("");
    setRequiredLevel(70);
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
                    <option>Project Manager</option>
                  </select>
                </div>
                <p className="text-sm text-gray-600">
                  The competencies defined here represent the target skills and proficiency levels required for the selected role.
                </p>
              </div>

              <div className="space-y-4">
                {competencies.map((competency, index) => (
                  <div key={`${competency.skillName}-${index}`} className="border rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">{competency.skillName}</h3>
                        <p className="text-sm text-gray-500">Role target</p>
                      </div>
                      <span className="text-indigo-600 font-semibold">{competency.requiredLevel}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-indigo-600 h-3 rounded-full" style={{ width: `${competency.requiredLevel}%` }} />
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
                  <input
                    value={skillName}
                    onChange={(e) => setSkillName(e.target.value)}
                    placeholder="e.g. Docker"
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Required Proficiency</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={requiredLevel}
                    onChange={(e) => setRequiredLevel(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="mt-2 text-sm text-gray-600">{requiredLevel}%</div>
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
