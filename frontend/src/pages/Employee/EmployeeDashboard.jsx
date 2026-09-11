import React from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import { FaBrain, FaBook, FaTasks, FaGraduationCap, FaCheckCircle, FaBookOpen, FaCalendarAlt, FaChartLine, FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./EmployeeDashboard.css";

function EmployeeDashboard() {
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Dashboard" role="Employee" userName="Bingi Prashanthi" />

        <div className="page-container">
          {/* Welcome Banner */}
          <div className="welcome-banner">
            <div>
              <h1>Welcome,Bingi Prashanthi 👋</h1>
              <p>Here's your learning overview and target competency milestones</p>
            </div>
            <button className="btn btn-primary-light" onClick={() => navigate("/gap-analysis")}>
              Run Skill Assessment
            </button>
          </div>

          {/* Statistics Cards Grid */}
          <div className="kpi-grid">
            <div className="kpi-card" onClick={() => navigate("/gap-analysis")}>
              <div className="kpi-content">
                <h3>3</h3>
                <p>Skill Gaps Identified</p>
              </div>
              <div className="kpi-icon blue">
                📊
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate("/my-learning")}>
              <div className="kpi-content">
                <h3>5</h3>
                <p>Courses In Progress</p>
              </div>
              <div className="kpi-icon blue">
                📚
              </div>
            </div>

            <div className="kpi-card" onClick={() => navigate("/assessments")}>
              <div className="kpi-content">
                <h3>2</h3>
                <p>Assessments Pending</p>
              </div>
              <div className="kpi-icon orange">
                📝
              </div>
            </div>

            <div className="kpi-card progress-kpi-card">
              <div className="kpi-content">
                <h3>75%</h3>
                <p>Overall Progress</p>
              </div>
              <div className="progress-ring">
                <svg width="60" height="60" viewBox="0 0 70 70">
                  <circle cx="35" cy="35" r="28" stroke="#E5E7EB" strokeWidth="7" fill="none" />
                  <circle
                    cx="35"
                    cy="35"
                    r="28"
                    stroke="#7C3AED"
                    strokeWidth="7"
                    fill="none"
                    strokeDasharray="176"
                    strokeDashoffset="44"
                    strokeLinecap="round"
                    transform="rotate(-90 35 35)"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Middle Section: Skill Gap Overview + Recommended for You */}
          <div className="dashboard-grid">
            {/* Skill Gap Overview */}
            <div className="card-box">
              <div className="card-box-header">
                <h3>Skill Gap Overview</h3>
              </div>
              <div className="overview-content">
                <div className="donut-circle-box">
                  <div className="donut-center">
                    <h2>3</h2>
                    <p>Total Gaps</p>
                  </div>
                </div>

                <div className="gap-legend-list">
                  <div className="legend-row">
                    <span className="legend-dot blue-dot"></span>
                    <span>Advanced (1)</span>
                  </div>
                  <div className="legend-row">
                    <span className="legend-dot green-dot"></span>
                    <span>Intermediate (1)</span>
                  </div>
                  <div className="legend-row">
                    <span className="legend-dot purple-dot"></span>
                    <span>Beginner (1)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended for You */}
            <div className="card-box">
              <div className="card-box-header">
                <h3>Recommended for You</h3>
                <button className="view-all-link" onClick={() => navigate("/training")}>
                  View All Recommendations →
                </button>
              </div>

              <div className="recommendations-list">
                <div className="recommendation-item">
                  <div className="rec-info">
                    <h4>Java Spring Boot</h4>
                    <span className="badge-pill purple">Intermediate</span>
                  </div>
                  <button className="btn btn-sm btn-outline" onClick={() => navigate("/training")}>
                    Start Course
                  </button>
                </div>

                <div className="recommendation-item">
                  <div className="rec-info">
                    <h4>System Design Basics</h4>
                    <span className="badge-pill beginner">Beginner</span>
                  </div>
                  <button className="btn btn-sm btn-outline" onClick={() => navigate("/training")}>
                    Start Course
                  </button>
                </div>

                <div className="recommendation-item">
                  <div className="rec-info">
                    <h4>SQL Advanced</h4>
                    <span className="badge-pill blue">Advanced</span>
                  </div>
                  <button className="btn btn-sm btn-outline" onClick={() => navigate("/training")}>
                    Start Course
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Recent Activities & Upcoming Deadlines */}
          <div className="dashboard-grid bottom-section">
            {/* Recent Activities Table */}
            <div className="card-box" style={{ margin: 0 }}>
              <div className="card-box-header">
                <h3>Recent Activities</h3>
              </div>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Activity Description</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Completed HTML Basics Course</td>
                      <td>2 Days Ago</td>
                      <td><span className="badge-pill green"><FaCheckCircle /> Completed</span></td>
                    </tr>
                    <tr>
                      <td>Assessment Submitted: SQL Quiz</td>
                      <td>3 Days Ago</td>
                      <td><span className="badge-pill blue">Submitted</span></td>
                    </tr>
                    <tr>
                      <td>Enrolled in Spring Boot Course</td>
                      <td>5 Days Ago</td>
                      <td><span className="badge-pill purple"><FaBookOpen /> In Progress</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Upcoming Training Deadlines & Sessions */}
            <div className="card-box" style={{ margin: 0 }}>
              <div className="card-box-header">
                <h3>Upcoming Deadlines & Sessions</h3>
                <button className="view-all-link" onClick={() => navigate("/assessments")}>
                  View All →
                </button>
              </div>

              <div className="deadlines-list">
                <div className="deadline-item">
                  <div className="deadline-icon orange">
                    <FaClock />
                  </div>
                  <div className="deadline-info">
                    <h4>Spring Boot & JPA Quiz</h4>
                    <p>Due in 2 days • Milestone Assessment</p>
                  </div>
                  <button className="btn btn-sm btn-primary" onClick={() => navigate("/assessments")}>
                    Take Quiz
                  </button>
                </div>

                <div className="deadline-item">
                  <div className="deadline-icon purple">
                    <FaCalendarAlt />
                  </div>
                  <div className="deadline-info">
                    <h4>Mentorship: Spring Security JWT</h4>
                    <p>Tomorrow at 3:00 PM • Host: Rahul Kumar</p>
                  </div>
                  <button className="btn btn-sm btn-secondary" onClick={() => navigate("/mentorship")}>
                    Join Room
                  </button>
                </div>

                <div className="deadline-item">
                  <div className="deadline-icon green">
                    <FaChartLine />
                  </div>
                  <div className="deadline-info">
                    <h4>Quarterly Skill Assessment Audit</h4>
                    <p>Due by 20 May 2024 • Manager Review</p>
                  </div>
                  <button className="btn btn-sm btn-outline" onClick={() => navigate("/gap-analysis")}>
                    Prepare
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;