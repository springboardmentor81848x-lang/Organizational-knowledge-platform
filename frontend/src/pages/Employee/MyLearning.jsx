import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import { FaGraduationCap, FaCheckCircle, FaPlay, FaMedal, FaExclamationTriangle, FaClock, FaRoute, FaCheck, FaArrowRight, FaCalendarAlt } from "react-icons/fa";
import { learningPathAPI } from "../../services/apiService";
import "./MyLearning.css";

const MyLearning = () => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [learningPath, setLearningPath] = useState(null);

  useEffect(() => {
    const fetchPath = async () => {
      const res = await learningPathAPI.getLearningPath(1);
      if (res && res.success) {
        setLearningPath(res.data);
      }
    };
    fetchPath();
  }, []);

  const learningItems = [
    { id: 1, title: "Java Spring Boot & JPA Deep Dive", status: "In Progress", progress: 65, completedModules: 8, totalModules: 12, velocity: "+15% skill improvement", expiry: "N/A" },
    { id: 2, title: "System Design & Architecture Patterns", status: "In Progress", progress: 40, completedModules: 4, totalModules: 10, velocity: "+10% skill improvement", expiry: "N/A" },
    { id: 3, title: "HTML5 & Modern CSS Responsive Design", status: "Completed", progress: 100, completedModules: 8, totalModules: 8, velocity: "+25% skill improvement", expiry: "Certified (Lifetime)" },
    { id: 4, title: "AWS Certified Developer Associate", status: "Certified", progress: 100, completedModules: 15, totalModules: 15, velocity: "+30% skill improvement", expiry: "Renewal Due: Mar 2026" },
  ];

  const filteredItems = learningItems.filter(item =>
    statusFilter === "All" ? true : item.status === statusFilter
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Learning Paths & Roadmaps" role="Employee" userName="R Amrutha" />

        <div className="page-container">
          <div className="page-header">
            <div className="page-header-text">
              <h2><FaRoute /> Structured Learning Roadmap & Velocity</h2>
              <p>Sequenced learning paths from Beginner to Advanced with completion time estimations.</p>
            </div>
          </div>

          {/* TASK 4: STRUCTURED LEARNING PATH ROADMAP */}
          {learningPath && (
            <div className="card-box" style={{ padding: "24px", marginBottom: "28px", borderRadius: "12px", background: "#ffffff", boxShadow: "0 4px 15px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", pb: "12px" }}>
                <div>
                  <h3 style={{ margin: 0, color: "#0f172a", fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaRoute color="#4f46e5" /> {learningPath.title}
                  </h3>
                  <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.88rem" }}>
                    Target Role Framework: <strong>{learningPath.targetRole}</strong>
                  </p>
                </div>

                <div style={{ display: "flex", gap: "16px", background: "#f8fafc", padding: "8px 16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div>
                    <small style={{ color: "#64748b", display: "block" }}>Total Estimated Time</small>
                    <strong style={{ color: "#4f46e5", fontSize: "1rem" }}><FaClock /> {learningPath.totalDuration}</strong>
                  </div>
                  <div style={{ borderLeft: "1px solid #cbd5e1", paddingLeft: "16px" }}>
                    <small style={{ color: "#64748b", display: "block" }}>Estimated Completion</small>
                    <strong style={{ color: "#10b981", fontSize: "1rem" }}><FaCalendarAlt /> {learningPath.estimatedTime}</strong>
                  </div>
                </div>
              </div>

              {/* Sequential Roadmap Steps (Beginner -> Intermediate -> Advanced) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
                {learningPath.stages?.map((stage, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "16px", position: "relative" }}>
                    {/* Circle Milestone Badge */}
                    <div style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background: stage.stage === 1 ? "#10b981" : stage.stage === 2 ? "#f59e0b" : "#4f46e5",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      flexShrink: 0,
                      boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
                    }}>
                      {stage.stage}
                    </div>

                    <div style={{ flex: 1, background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ margin: 0, color: "#1e293b", fontSize: "1.05rem" }}>{stage.title}</h4>
                        <span style={{ fontSize: "0.8rem", background: "#e0e7ff", color: "#3730a3", padding: "4px 10px", borderRadius: "12px", fontWeight: 600 }}>
                          <FaClock /> {stage.estimatedHours} Hours
                        </span>
                      </div>

                      <div style={{ margin: "10px 0 12px 0", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {stage.skillsCovered?.map((sk, sidx) => (
                          <span key={sidx} style={{ background: "#e2e8f0", color: "#334155", padding: "3px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600 }}>
                            Target Skill: {sk}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px", marginTop: "12px" }}>
                        {stage.courses?.map((crs, cidx) => (
                          <div key={cidx} style={{ background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <strong style={{ fontSize: "0.88rem", display: "block", color: "#0f172a" }}>{crs.title}</strong>
                              <small style={{ color: "#64748b" }}>{crs.provider} • {crs.duration}</small>
                            </div>
                            <a href={crs.link} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
                              Launch <FaArrowRight />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Learning Progress Cards */}
          <div className="card-box" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>Active Enrollments & Course Progress</h3>
              <select
                className="select-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: "200px" }}
              >
                <option value="All">All Statuses</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Certified">Certified</option>
              </select>
            </div>

            <div className="learning-cards-grid">
              {filteredItems.map((item) => (
                <div key={item.id} className="card-box learning-card">
                  <div className="learning-card-header">
                    <span className={`badge-pill ${
                      item.status === 'Completed' ? 'green' :
                      item.status === 'Certified' ? 'blue' : 'purple'
                    }`}>
                      {item.status}
                    </span>
                    <span className="velocity-tag">{item.velocity}</span>
                  </div>

                  <h3>{item.title}</h3>

                  <div className="progress-section">
                    <div className="progress-label-row">
                      <span>Progress: {item.completedModules}/{item.totalModules} Modules</span>
                      <strong>{item.progress}%</strong>
                    </div>
                    <div className="progress-bg">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${item.progress}%`,
                          backgroundColor: item.progress === 100 ? "#10b981" : "#7c3aed"
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="learning-card-footer">
                    <span className="expiry-info"><FaClock /> {item.expiry}</span>
                    {item.status === "In Progress" && (
                      <button className="btn btn-primary btn-sm">Continue Learning →</button>
                    )}
                    {(item.status === "Completed" || item.status === "Certified") && (
                      <button className="btn btn-secondary btn-sm"><FaMedal /> View Certificate</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyLearning;
