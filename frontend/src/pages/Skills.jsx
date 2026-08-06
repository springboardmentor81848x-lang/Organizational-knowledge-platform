import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

function Skills() {
  const [skills, setSkills] = useState([
    {
      name: "Java",
      category: "Development",
      description: "Backend programming and object-oriented design.",
      level: 85,
    },
    {
      name: "React",
      category: "Frontend",
      description: "Component-driven UI development and state management.",
      level: 70,
    },
    {
      name: "SQL",
      category: "Data",
      description: "Database querying, optimization, and reporting.",
      level: 80,
    },
  ]);

  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState(50);
  const [newSkillCategory, setNewSkillCategory] = useState("Development");

  const addSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setSkills([
      ...skills,
      {
        name: newSkillName.trim(),
        category: newSkillCategory,
        description: "New skill added to inventory.",
        level: newSkillLevel,
      },
    ]);
    setNewSkillName("");
    setNewSkillLevel(50);
    setNewSkillCategory("Development");
  };

  const updateSkillLevel = (index, level) => {
    setSkills(skills.map((skill, idx) => (idx === index ? { ...skill, level } : skill)));
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar role={(localStorage.getItem("role") || "EMPLOYEE")} />

      <div className="flex-1">
        <Navbar title="Skill Inventory" />

        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">Skill Inventory</h2>
          <p className="text-gray-500 mb-6">
            Track your current proficiency levels and add new skills to your inventory.
          </p>

          <div className="grid xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Current Skills</h3>
              <div className="space-y-6">
                {skills.map((skill, index) => (
                  <div key={`${skill.name}-${index}`} className="border rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="text-md font-semibold">{skill.name}</h4>
                        <p className="text-sm text-gray-500">{skill.category}</p>
                      </div>
                      <span className="text-sm font-semibold text-indigo-600">{skill.level}%</span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{skill.description}</p>

                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div
                        className="bg-indigo-600 h-3 rounded-full"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600">Update proficiency:</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={skill.level}
                        onChange={(e) => updateSkillLevel(index, Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Add New Skill</h3>
              <form onSubmit={addSkill} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Skill Name</label>
                  <input
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g. Kubernetes"
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Category</label>
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option>Development</option>
                    <option>Frontend</option>
                    <option>Data</option>
                    <option>Platform</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Proficiency Level</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="mt-2 text-sm text-gray-600">Current level: {newSkillLevel}%</div>
                </div>

                <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                  Add Skill to Inventory
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Skills;
