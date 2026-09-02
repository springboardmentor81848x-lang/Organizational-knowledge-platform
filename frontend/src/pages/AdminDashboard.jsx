import React, { useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import { FaShieldAlt, FaServer, FaUsers, FaDatabase, FaPlus, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([
    { id: 1, name: "R Amrutha", email: "r.amrutha@org.com", role: "Employee", dept: "Software Eng", status: "Active" },
    { id: 2, name: "Jane Smith", email: "j.smith@org.com", role: "Manager", dept: "Software Eng", status: "Active" },
    { id: 3, name: "Sarah Jenkins", email: "s.jenkins@org.com", role: "HR Specialist", dept: "Human Resources", status: "Active" },
    { id: 4, name: "Alex Rivera", email: "a.rivera@org.com", role: "System Administrator", dept: "IT Security", status: "Active" },
  ]);

  const systemServices = [
    { name: "Spring Boot Microservices Backend", status: "Healthy", latency: "14ms", type: "Backend API" },
    { name: "PostgreSQL Primary Database", status: "Healthy", latency: "6ms", type: "Storage" },
    { name: "Redis Caching Layer", status: "Healthy", latency: "2ms", type: "Cache" },
    { name: "OpenAI LLM Recommendation Engine", status: "Operational", latency: "120ms", type: "AI Gateway" },
    { name: "Apache Kafka Event Bus", status: "Healthy", latency: "5ms", type: "Messaging" },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="System Admin Console" role="System Administrator" userName="Alex Rivera" />

        <div className="page-container">
          <div className="welcome-banner admin-banner">
            <div>
              <h1>System Administration & Security Console 🛡️</h1>
              <p>Manage user access roles, system microservices health, and API gateways.</p>
            </div>
            <button className="btn btn-primary" onClick={() => alert("Open Provision New User Modal")}>
              <FaPlus /> Provision User
            </button>
          </div>

          {/* System Health Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-content">
                <h3>99.98%</h3>
                <p>System Uptime</p>
              </div>
              <div className="kpi-icon green">
                <FaServer />
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-content">
                <h3>340</h3>
                <p>Total Active Accounts</p>
              </div>
              <div className="kpi-icon blue">
                <FaUsers />
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-content">
                <h3>5 / 5</h3>
                <p>Microservices Healthy</p>
              </div>
              <div className="kpi-icon purple">
                <FaDatabase />
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-content">
                <h3>JWT + OAuth2</h3>
                <p>Security Gateway</p>
              </div>
              <div className="kpi-icon orange">
                <FaShieldAlt />
              </div>
            </div>
          </div>

          {/* Microservices Status Table */}
          <div className="card-box">
            <div className="card-box-header">
              <h3>System Infrastructure & Microservices Status</h3>
            </div>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Service Type</th>
                    <th>Latency</th>
                    <th>Health Status</th>
                  </tr>
                </thead>
                <tbody>
                  {systemServices.map((svc, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: "#0f172a" }}>{svc.name}</td>
                      <td>{svc.type}</td>
                      <td>{svc.latency}</td>
                      <td>
                        <span className="badge-pill green"><FaCheckCircle /> {svc.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Management Table */}
          <div className="card-box">
            <div className="card-box-header">
              <h3>User & Role Management</h3>
            </div>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600, color: "#0f172a" }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className="badge-pill purple">{u.role}</span></td>
                      <td>{u.dept}</td>
                      <td><span className="badge-pill green">{u.status}</span></td>
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

export default AdminDashboard;
