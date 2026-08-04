import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

function Skills() {
  const [skills, setSkills] = useState([
    { name: "Java", level: 90 },
    { name: "React", level: 70 },
    { name: "SQL", level: 80 },
  ]);

  const [newSkill, setNewSkill] = useState("");

  const addSkill = (e) => {
    e.preventDefault();
    if (!newSkill) return;
    setSkills([...skills, { name: newSkill, level: 10 }]);
    setNewSkill("");
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar role={(localStorage.getItem("role") || "EMPLOYEE")} />

      <div className="flex-1">
        <Navbar title="Skills" />

        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">Your Skills</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              {skills.map((s) => (
                <div key={s.name} className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span>{s.name}</span>
                    <span>{s.level}%</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-600 h-3 rounded-full" style={{ width: `${s.level}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-3">Add New Skill</h3>
              <form onSubmit={addSkill} className="flex gap-3">
                <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Skill name" className="flex-1 border rounded px-3 py-2" />
                <button className="bg-indigo-600 text-white px-4 py-2 rounded">Add</button>
              </form>

              <p className="text-sm text-gray-500 mt-4">Tip: After adding a skill, update your progress by completing courses.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Skills;
