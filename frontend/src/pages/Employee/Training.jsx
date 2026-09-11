import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import { FaBookOpen, FaFilter, FaClock, FaExternalLinkAlt, FaCheckCircle, FaStar, FaRobot, FaLightbulb, FaGraduationCap } from "react-icons/fa";
import { coursesAPI, aiAPI, learningProgressAPI } from "../../services/apiService";
import "./Training.css";

const Training = () => {
  const [providerFilter, setProviderFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Relevance");

  const [courses, setCourses] = useState([]);
  const [aiPlan, setAiPlan] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [enrolledIds, setEnrolledIds] = useState([]);

  useEffect(() => {
    // Fetch courses catalog from API/Database
    const loadCourses = async () => {
      const res = await coursesAPI.getCourses();
      if (res && res.success) {
        setCourses(res.data);
      }
    };
    loadCourses();

    // Trigger AI LLM recommendation engine based on current gaps
    const fetchAiPlan = async () => {
      setLoadingAi(true);
      const res = await aiAPI.getRecommendations([
        { skill: "Microservices", level: "Critical" },
        { skill: "Kubernetes", level: "Critical" },
        { skill: "System Design", level: "Moderate" }
      ], "Software Developer");
      if (res && res.success) {
        setAiPlan(res.data);
      }
      setLoadingAi(false);
    };
    fetchAiPlan();
  }, []);

  const handleEnroll = async (id) => {
    try { await learningProgressAPI.enroll(1, id); setEnrolledIds((prev) => [...new Set([...prev, id])]); alert("Successfully enrolled in training module!"); }
    catch (e) { alert(e?.response?.data?.error || "Unable to enroll. Please try again."); }
  };

  // Smart Recommendation Logic (Task 6)
  const filteredCourses = courses.filter(course => {
    const matchesProvider = providerFilter === "All" || course.provider.toLowerCase().includes(providerFilter.toLowerCase());
    const matchesLevel = levelFilter === "All" || course.level === levelFilter;
    return matchesProvider && matchesLevel;
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Training & External Catalogs" role="Employee" userName="Bingi Prashanthi" />

        <div className="page-container">
          <div className="page-header">
            <div className="page-header-text">
              <h2><FaBookOpen /> Recommended External Learning Catalogs</h2>
              <p>AI-tailored course recommendations from Infosys Springboard, Coursera, Udemy, edX & LinkedIn Learning.</p>
            </div>
          </div>

          {/* AI LLM RECOMMENDATION INSIGHT BOX (Task 3) */}
          <div className="card-box" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", color: "#ffffff", padding: "24px", borderRadius: "12px", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px", color: "#818cf8" }}>
                <FaRobot /> AI / LLM Personalized Training Recommendation
              </h3>
              <span style={{ background: "rgba(255, 255, 255, 0.15)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem" }}>
                Powered by Gemini LLM API
              </span>
            </div>

            {loadingAi ? (
              <p style={{ marginTop: "12px", color: "#c7d2fe" }}>AI is generating personalized recommendations based on detected skill gaps...</p>
            ) : aiPlan ? (
              <div style={{ marginTop: "16px" }}>
                <p style={{ fontSize: "1rem", color: "#e0e7ff", lineHeight: "1.6" }}>{aiPlan.summary}</p>
                <div style={{ marginTop: "12px", background: "rgba(255, 255, 255, 0.08)", padding: "16px", borderRadius: "8px" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#a5b4fc", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaLightbulb color="#f59e0b" /> Actionable Step-by-Step AI Guidance:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: "20px", color: "#c7d2fe" }}>
                    {aiPlan.priorityActions?.map((action, idx) => (
                      <li key={idx} style={{ marginBottom: "6px" }}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>

          {/* Catalog Filter Controls (Task 5 & 6) */}
          <div className="filter-bar">
            <div className="filter-group">
              <label><FaGraduationCap /> Learning Platform</label>
              <select
                className="select-control"
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
              >
                <option value="All">All Platforms (Infosys Springboard, Coursera, Udemy)</option>
                <option value="Infosys Springboard">Infosys Springboard</option>
                <option value="Coursera">Coursera</option>
                <option value="Udemy">Udemy</option>
              </select>
            </div>

            <div className="filter-group">
              <label><FaFilter /> Proficiency Level Filter</label>
              <select
                className="select-control"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="All">All Levels (Beginner to Advanced)</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Recommendation Priority</label>
              <select
                className="select-control"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="Relevance">Missing Skill Priority (Critical Gaps First)</option>
                <option value="Rating">Highest Rated (4.8+)</option>
                <option value="Duration">Shortest Duration</option>
              </select>
            </div>
          </div>

          {/* External Courses Grid (Task 5) */}
          <div className="courses-grid">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledIds.includes(course.id);
              return (
                <div key={course.id} className="course-card-lg">
                  <div className="course-card-header" style={{ borderTopColor: course.color || "#3b82f6" }}>
                    <span className="course-icon-bubble">{course.icon || "📚"}</span>
                    <div className="course-provider">
                      <span style={{ fontWeight: 700, color: "#1e293b" }}>{course.provider}</span>
                      <span className="rating"><FaStar color="#f59e0b" /> {course.rating}</span>
                    </div>
                  </div>

                  <div className="course-card-body">
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    
                    <div className="course-tags">
                      <span className={`badge-pill ${course.level.toLowerCase()}`}>
                        {course.level}
                      </span>
                      <span className="duration-tag">
                        <FaClock /> {course.duration}
                      </span>
                      <span className="badge-pill blue" style={{ background: "#e0f2fe", color: "#0369a1" }}>
                        Target: {course.skill_name}
                      </span>
                    </div>
                  </div>

                  <div className="course-card-footer">
                    {isEnrolled ? (
                      <span className="enrolled-badge">
                        <FaCheckCircle /> Enrolled
                      </span>
                    ) : (
                      <a
                        href={course.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleEnroll(course.id)}
                        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        Enroll on {course.provider.split(" ")[0]} <FaExternalLinkAlt style={{ fontSize: "0.75rem" }} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Training;
