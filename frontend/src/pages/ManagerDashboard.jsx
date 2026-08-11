import React, { useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import { FaUserTie, FaUsers, FaChartLine, FaCheck, FaTimes, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "./MnagerDashboard.css";

const ManagerDashboard = () => {
  const [approvals, setApprovals] = useState([
    { id: 1, employee: "Rahul Kumar", request: "Course Enrollment", course: "Advanced Java", date: "10 May 2024", status: "Pending" },
    { id: 2, employee: "Sneha Patil", request: "Course Enrollment", course: "AWS Essentials", date: "09 May 2024", status: "Pending" },
    { id: 3, employee: "Vikram Malhotra", request: "Assessment Extension", course: "System Design Quiz", date: "08 May 2024", status: "Pending" },
  ]);

  const trendData = [
    { week: "Week 1", progress: 20 },
    { week: "Week 2", progress: 45 },
    { week: "Week 3", progress: 60 },
    { week: "Week 4", progress: 80 },
  ];

  const skillGapSummary = [
    { skill: "Java", gaps: 5, max: 5, color: "#7c3aed" },
    { skill: "Spring Boot", gaps: 4, max: 5, color: "#3b82f6" },
    { skill: "SQL", gaps: 3, max: 5, color: "#f59e0b" },
    { skill: "System Design", gaps: 3, max: 5, color: "#a855f7" },
    { skill: "AWS", gaps: 2, max: 5, color: "#ef4444" },
  ];

  const handleApprove = (id) => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, status: "Approved" } : a));
  };

  const handleReject = (id) => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, status: "Rejected" } : a));
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Manager Dashboard" role="Manager" userName="Jane Smith" />

        <div className="page-container">
          {/* Welcome Header */}
          <div className="welcome-banner manager-banner">
            <div>
              <h1>Welcome, Jane Smith 👋</h1>
              <p>Team Performance Overview & Skill Gap Intelligence</p>
            </div>
          </div>

          {/* Statistics KPI Grid */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-content">
                <h3>12</h3>
                <p>Team Members</p>
              </div>
              <div className="kpi-icon purple">
                <FaUsers />
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-content">
                <h3>18</h3>
                <p>Skill Gaps Identified</p>
              </div>
              <div className="kpi-icon orange">
                <FaChartLine />
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-content">
                <h3>7</h3>
                <p>Courses In Progress</p>
              </div>
              <div className="kpi-icon blue">
                <FaUserTie />
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-content">
                <h3>68%</h3>
                <p>Team Avg. Progress</p>
              </div>
              <div className="kpi-icon green">
                <FaCheckCircle />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="dashboard-grid">
            {/* Team Skill Gap Summary */}
            <div className="card-box">
              <div className="card-box-header">
                <h3>Team Skill Gap Summary</h3>
                <span className="subtitle">Count of team members with identified gap</span>
              </div>

              <div className="skill-gap-bars">
                {skillGapSummary.map((item, idx) => (
                  <div key={idx} className="gap-bar-row">
                    <div className="bar-info">
                      <span className="skill-label">{item.skill}</span>
                      <span className="gap-count-tag">{item.gaps} Members</span>
                    </div>
                    <div className="progress-bg">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(item.gaps / item.max) * 100}%`,
                          backgroundColor: item.color
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Progress Line Chart */}
            <div className="card-box">
              <div className="card-box-header">
                <h3>Team Learning Progress</h3>
                <span className="subtitle">Weekly progress percentage completion</span>
              </div>

              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="week" stroke="#64748b" />
                    <YAxis domain={[0, 100]} stroke="#64748b" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="progress"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 6, fill: "#10b981" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Pending Approvals Table */}
          <div className="card-box">
            <div className="card-box-header">
              <h3>Pending Approvals</h3>
              <span className="subtitle">Training and course request approvals</span>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Request Type</th>
                    <th>Course Name</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {approvals.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, color: "#0f172a" }}>{item.employee}</td>
                      <td>{item.request}</td>
                      <td>{item.course}</td>
                      <td>{item.date}</td>
                      <td>
                        {item.status === "Pending" ? (
                          <div className="approval-actions">
                            <button
                              className="approve-btn"
                              title="Approve Request"
                              onClick={() => handleApprove(item.id)}
                            >
                              <FaCheck />
                            </button>
                            <button
                              className="reject-btn"
                              title="Reject Request"
                              onClick={() => handleReject(item.id)}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ) : item.status === "Approved" ? (
                          <span className="badge-pill green"><FaCheckCircle /> Approved</span>
                        ) : (
                          <span className="badge-pill red"><FaTimesCircle /> Rejected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;