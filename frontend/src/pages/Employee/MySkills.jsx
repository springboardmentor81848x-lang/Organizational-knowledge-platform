import React, { useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import { FaPlus, FaEdit, FaTrash, FaBrain, FaSearch, FaCheckCircle } from "react-icons/fa";
import "./MySkills.css";

const MySkills = () => {
  const [skills, setSkills] = useState([
    { id: 1, name: "Java", category: "Programming", level: "Advanced", progress: 85, color: "#22c55e", date: "01 May 2024" },
    { id: 2, name: "Spring Boot", category: "Framework", level: "Intermediate", progress: 60, color: "#eab308", date: "01 May 2024" },
    { id: 3, name: "SQL", category: "Database", level: "Intermediate", progress: 55, color: "#eab308", date: "25 Apr 2024" },
    { id: 4, name: "HTML", category: "Web", level: "Advanced", progress: 90, color: "#22c55e", date: "20 Apr 2024" },
    { id: 5, name: "CSS", category: "Web", level: "Intermediate", progress: 65, color: "#eab308", date: "20 Apr 2024" },
    { id: 6, name: "JavaScript", category: "Programming", level: "Beginner", progress: 30, color: "#ef4444", date: "15 Apr 2024" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: "", category: "Programming", level: "Beginner" });

  const getLevelProgress = (lvl) => {
    switch (lvl) {
      case "Expert": return { progress: 95, color: "#10b981" };
      case "Advanced": return { progress: 85, color: "#22c55e" };
      case "Intermediate": return { progress: 60, color: "#eab308" };
      case "Beginner": return { progress: 35, color: "#ef4444" };
      default: return { progress: 10, color: "#94a3b8" };
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;

    const { progress, color } = getLevelProgress(newSkill.level);
    const added = {
      id: Date.now(),
      name: newSkill.name,
      category: newSkill.category,
      level: newSkill.level,
      progress,
      color,
      date: "Today"
    };

    setSkills([added, ...skills]);
    setNewSkill({ name: "", category: "Programming", level: "Beginner" });
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this skill?")) {
      setSkills(skills.filter((s) => s.id !== id));
    }
  };

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || skill.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Skill Management" role="Employee" userName="Bingi Prashanthi" />

        <div className="page-container">
          <div className="page-header">
            <div className="page-header-text">
              <h2><FaBrain /> My Skills</h2>
              <p>Manage your technical skills, self-ratings, and proficiency inventory.</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <FaPlus /> Add Skill
            </button>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="navbar-search" style={{ margin: 0 }}>
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search skill name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="select-control"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Programming">Programming</option>
              <option value="Framework">Framework</option>
              <option value="Database">Database</option>
              <option value="Web">Web</option>
            </select>
          </div>

          {/* Skills Table Card */}
          <div className="card-box">
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Skill Name</th>
                    <th>Category</th>
                    <th>Proficiency Level</th>
                    <th>Last Assessed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSkills.map((skill) => (
                    <tr key={skill.id}>
                      <td className="font-semibold" style={{ fontWeight: 600, color: "#0f172a" }}>
                        {skill.name}
                      </td>
                      <td>
                        <span className="category-tag">{skill.category}</span>
                      </td>
                      <td>
                        <div className="proficiency-bar-wrapper">
                          <span className={`badge-pill ${skill.level.toLowerCase()}`}>
                            {skill.level}
                          </span>
                          <div className="progress-bg">
                            <div
                              className="progress-fill"
                              style={{ width: `${skill.progress}%`, backgroundColor: skill.color }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>{skill.date}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="icon-btn edit" title="Edit Skill">
                            <FaEdit />
                          </button>
                          <button className="icon-btn delete" title="Delete Skill" onClick={() => handleDelete(skill.id)}>
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              Total Skills: <strong>{filteredSkills.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Skill</h3>
            <form onSubmit={handleAddSkill} style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label>Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. Docker, Python, Kubernetes"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  className="select-control"
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                >
                  <option value="Programming">Programming</option>
                  <option value="Framework">Framework</option>
                  <option value="Database">Database</option>
                  <option value="Web">Web</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Architecture">Architecture</option>
                </select>
              </div>

              <div className="form-group">
                <label>Proficiency Level</label>
                <select
                  className="select-control"
                  value={newSkill.level}
                  onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                >
                  <option value="Unaware">Unaware (0%)</option>
                  <option value="Beginner">Beginner (35%)</option>
                  <option value="Intermediate">Intermediate (60%)</option>
                  <option value="Advanced">Advanced (85%)</option>
                  <option value="Expert">Expert (95%)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySkills;
