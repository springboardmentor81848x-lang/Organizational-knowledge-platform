import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function EmployeeSkillAssessment() {
  const [skills, setSkills] = useState([
    { skillName: "Java", currentLevel: 85, comments: "Strong backend skills" },
    { skillName: "React", currentLevel: 70, comments: "Good UI development" },
    { skillName: "SQL", currentLevel: 78, comments: "Solid query skills" },
  ]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState(50);
  const [newComments, setNewComments] = useState("");

  const addAssessment = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setSkills([
      ...skills,
      {
        skillName: newSkillName.trim(),
        currentLevel: newSkillLevel,
        comments: newComments.trim() || "Requires assessment",
      },
    ]);
    setNewSkillName("");
    setNewSkillLevel(50);
    setNewComments("");
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar role={(localStorage.getItem("role") || "EMPLOYEE")} />

      <div className="flex-1">
        <Navbar title="Employee Skill Assessment" />

        <div className="p-8">
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-2xl font-bold mb-3">Employee Skill Assessment</h2>
            <p className="text-gray-500">
              Review your skills, self-assess proficiency levels, and manage assessment notes for future development.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Your Assessment</h3>
              <div className="space-y-4">
                {skills.map((skill, index) => (
                  <div key={`${skill.skillName}-${index}`} className="border rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="text-md font-semibold">{skill.skillName}</h4>
                        <p className="text-sm text-gray-500">{skill.comments}</p>
                      </div>
                      <span className="text-indigo-600 font-semibold">{skill.currentLevel}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-green-600 h-3 rounded-full" style={{ width: `${skill.currentLevel}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Add Assessment Entry</h3>
              <form onSubmit={addAssessment} className="space-y-4">
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
                  <label className="block mb-2 text-sm font-medium">Self-Assessment Level</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="mt-2 text-sm text-gray-600">{newSkillLevel}%</div>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Comments</label>
                  <textarea
                    value={newComments}
                    onChange={(e) => setNewComments(e.target.value)}
                    rows="4"
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    placeholder="Feedback or development notes"
                  />
                </div>
                <button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition">
                  Save Assessment
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeSkillAssessment;
