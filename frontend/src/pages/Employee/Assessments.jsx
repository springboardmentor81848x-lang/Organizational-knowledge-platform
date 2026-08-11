import React, { useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import { FaTasks, FaClipboardCheck, FaUsers, FaUserCheck, FaPlay, FaCheckCircle, FaClock } from "react-icons/fa";
import "./Assessments.css";

const Assessments = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [assessments, setAssessments] = useState([
    {
      id: 1,
      title: "Spring Boot & Microservices Self-Assessment",
      type: "Self Assessment",
      dueDate: "12 May 2024",
      questionsCount: 15,
      estimatedTime: "20 mins",
      status: "Pending",
      category: "Backend"
    },
    {
      id: 2,
      title: "360-Degree Peer Assessment: Rahul Kumar",
      type: "Peer Review",
      dueDate: "15 May 2024",
      questionsCount: 10,
      estimatedTime: "15 mins",
      status: "Pending",
      category: "Peer Feedback"
    },
    {
      id: 3,
      title: "SQL & Relational Databases Evaluation",
      type: "Self Assessment",
      dueDate: "01 May 2024",
      score: "85%",
      status: "Completed",
      category: "Database"
    },
    {
      id: 4,
      title: "Quarterly Manager Skill Competency Audit",
      type: "Manager Assessment",
      dueDate: "20 Apr 2024",
      score: "90%",
      status: "Completed",
      category: "Management"
    }
  ]);

  const handleStartAssessment = (id) => {
    alert("Starting interactive assessment quiz! Your score will automatically recalculate your skill gap scores.");
    setAssessments(assessments.map(a => a.id === id ? { ...a, status: "Completed", score: "88%" } : a));
  };

  const filteredAssessments = assessments.filter(a =>
    activeTab === "pending" ? a.status === "Pending" : a.status === "Completed"
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Assessments & Surveys" role="Employee" userName="R Amrutha" />

        <div className="page-container">
          <div className="page-header">
            <div className="page-header-text">
              <h2><FaTasks /> Skill Assessments & Peer Reviews</h2>
              <p>Complete self-assessments, 360 peer evaluations, and manager skill check-ins.</p>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-content">
                <h3>2</h3>
                <p>Pending Assessments</p>
              </div>
              <div className="kpi-icon orange">
                <FaClock />
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-content">
                <h3>2</h3>
                <p>Completed Assessments</p>
              </div>
              <div className="kpi-icon green">
                <FaCheckCircle />
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-content">
                <h3>87.5%</h3>
                <p>Average Assessment Score</p>
              </div>
              <div className="kpi-icon purple">
                <FaClipboardCheck />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="assessment-tabs">
            <button
              className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              <FaClock /> Pending ({assessments.filter(a => a.status === "Pending").length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              <FaCheckCircle /> Completed ({assessments.filter(a => a.status === "Completed").length})
            </button>
          </div>

          {/* List of Assessments */}
          <div className="assessment-list">
            {filteredAssessments.map((item) => (
              <div key={item.id} className="card-box assessment-card">
                <div className="assessment-icon-wrapper">
                  {item.type === "Peer Review" ? <FaUsers color="#7c3aed" /> : <FaUserCheck color="#2563eb" />}
                </div>

                <div className="assessment-info">
                  <div className="assessment-meta">
                    <span className="type-tag">{item.type}</span>
                    <span className="category-tag">{item.category}</span>
                  </div>
                  <h3>{item.title}</h3>
                  {item.status === "Pending" ? (
                    <p><FaClock /> Due by <strong>{item.dueDate}</strong> • {item.questionsCount} Questions ({item.estimatedTime})</p>
                  ) : (
                    <p><FaCheckCircle color="#10b981" /> Completed • Score achieved: <strong style={{ color: "#10b981" }}>{item.score}</strong></p>
                  )}
                </div>

                <div className="assessment-action">
                  {item.status === "Pending" ? (
                    <button className="btn btn-primary" onClick={() => handleStartAssessment(item.id)}>
                      <FaPlay /> Start Assessment
                    </button>
                  ) : (
                    <button className="btn btn-secondary btn-sm">
                      View Report
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessments;
