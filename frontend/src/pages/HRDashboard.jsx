import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import { FaUsersCog, FaBuilding, FaChartPie, FaDollarSign, FaFileExport } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "./HRDashboard.css";

const HRDashboard = () => {
  const departmentSkillsData = [
    { department: "Software Eng", coverage: 82, gaps: 14 },
    { department: "Infrastructure", coverage: 75, gaps: 9 },
    { department: "Data & AI", coverage: 90, gaps: 4 },
    { department: "Product & UI", coverage: 88, gaps: 6 },
    { department: "Cybersecurity", coverage: 68, gaps: 12 },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="HR Dashboard & Org Intelligence" role="HR Specialist" userName="Sarah Jenkins" />

        <div className="page-container">
          <div className="welcome-banner hr-banner">
            <div>
              <h1>HR Intelligence & Workforce Analytics 🏢</h1>
              <p>Organization-wide skill inventory, training ROI metrics, and strategic workforce forecasting.</p>
            </div>
            <button className="btn btn-secondary" onClick={() => alert("Downloading organization gap intelligence PDF...")}>
              <FaFileExport /> Export HR Report
            </button>
          </div>

          {/* KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-content">
                <h3>340</h3>
                <p>Total Employees Assessed</p>
              </div>
              <div className="kpi-icon blue">
                <FaBuilding />
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-content">
                <h3>80.6%</h3>
                <p>Org Skill Coverage Rate</p>
              </div>
              <div className="kpi-icon green">
                <FaChartPie />
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-content">
                <h3>45</h3>
                <p>Active Training Programs</p>
              </div>
              <div className="kpi-icon purple">
                <FaUsersCog />
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-content">
                <h3>$42,500</h3>
                <p>Estimated Training ROI</p>
              </div>
              <div className="kpi-icon orange">
                <FaDollarSign />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="dashboard-grid">
            <div className="card-box">
              <div className="card-box-header">
                <h3>Department Skill Coverage vs. Gaps</h3>
                <span className="subtitle">Percentage skill coverage across organization</span>
              </div>

              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={departmentSkillsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="department" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Bar dataKey="coverage" name="Skill Coverage %" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="gaps" name="Open Gaps" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-box">
              <div className="card-box-header">
                <h3>High-Priority Organizational Skill Needs</h3>
              </div>
              <div className="skill-gap-bars">
                <div className="gap-bar-row">
                  <div className="bar-info">
                    <span>Cloud Architecture (AWS / Azure)</span>
                    <span className="gap-count-tag">18 Dept Gaps</span>
                  </div>
                  <div className="progress-bg">
                    <div className="progress-fill" style={{ width: "85%", backgroundColor: "#ef4444" }}></div>
                  </div>
                </div>

                <div className="gap-bar-row">
                  <div className="bar-info">
                    <span>GenAI & LLM Integration</span>
                    <span className="gap-count-tag">14 Dept Gaps</span>
                  </div>
                  <div className="progress-bg">
                    <div className="progress-fill" style={{ width: "70%", backgroundColor: "#f59e0b" }}></div>
                  </div>
                </div>

                <div className="gap-bar-row">
                  <div className="bar-info">
                    <span>Kubernetes & DevOps</span>
                    <span className="gap-count-tag">10 Dept Gaps</span>
                  </div>
                  <div className="progress-bg">
                    <div className="progress-fill" style={{ width: "55%", backgroundColor: "#3b82f6" }}></div>
                  </div>
                </div>

                <div className="gap-bar-row">
                  <div className="bar-info">
                    <span>Cybersecurity Compliance</span>
                    <span className="gap-count-tag">8 Dept Gaps</span>
                  </div>
                  <div className="progress-bg">
                    <div className="progress-fill" style={{ width: "40%", backgroundColor: "#10b981" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
