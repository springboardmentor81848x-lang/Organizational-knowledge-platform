import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaBrain,
  FaChartLine,
  FaBookOpen,
  FaTasks,
  FaGraduationCap,
  FaBell,
  FaFileAlt,
  FaUserTie,
  FaUsersCog,
  FaShieldAlt,
  FaSignOutAlt,
  FaHandsHelping,
  FaCheckCircle
} from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand" onClick={() => navigate("/employee-dashboard")}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="Knowledge Gap Logo"
          className="brand-logo"
        />
        <div className="brand-text">
          <h2>Knowledge Gap</h2>
          <span>Intelligence Platform</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Core Modules</div>
        <ul>
          <li>
            <NavLink to="/employee-dashboard" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
              <FaHome className="nav-icon" /> <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/my-profile" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
              <FaUser className="nav-icon" /> <span>My Profile</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/my-skills" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
              <FaBrain className="nav-icon" /> <span>My Skills</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/gap-analysis" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
              <FaChartLine className="nav-icon" /> <span>Gap Analysis</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/training" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
              <FaBookOpen className="nav-icon" /> <span>Training</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/assessments" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
              <FaTasks className="nav-icon" /> <span>Assessments</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/my-learning" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
              <FaGraduationCap className="nav-icon" /> <span>My Learning</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/mentorship" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
              <FaHandsHelping className="nav-icon" /> <span>Mentorship</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/notifications" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
              <FaBell className="nav-icon" /> <span>Notifications</span>
              <span className="nav-badge">3</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
              <FaFileAlt className="nav-icon" /> <span>Reports</span>
            </NavLink>
          </li>
        </ul>

        <div className="nav-section-title">Portals & Roles</div>
        <ul>
          <li>
            <NavLink to="/manager-dashboard" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
              <FaUserTie className="nav-icon" /> <span>Manager Portal</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/hr-dashboard" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
              <FaUsersCog className="nav-icon" /> <span>HR Portal</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin-dashboard" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
              <FaShieldAlt className="nav-icon" /> <span>Admin Console</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Sidebar Footer with Active Profile Status & Logout Button */}
      <div className="sidebar-footer">
        <div className="system-status-box">
          <FaCheckCircle className="status-icon" />
          <div className="status-info">
            <span>System Status</span>
            <strong>Connected to Spring Boot API</strong>
          </div>
        </div>

        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="logout-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
