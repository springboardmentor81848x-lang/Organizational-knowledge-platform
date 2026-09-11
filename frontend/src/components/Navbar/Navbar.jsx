import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaBars, FaSearch, FaUserCircle, FaExchangeAlt, FaSignOutAlt } from "react-icons/fa";
import "./Navbar.css";

const Navbar = ({ title = "Dashboard", role = "Employee" }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const storedName = localStorage.getItem("userName") || "Bingi Prashanthi";
  const storedEmail = localStorage.getItem("userEmail") || "prashnthi123@org.com";

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <button className="menu-toggle-btn" aria-label="Toggle Navigation">
          <FaBars />
        </button>
        <h2 className="navbar-title">{title}</h2>
      </div>

      <div className="navbar-right">
        {/* Quick Search */}
        <div className="navbar-search">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search skills, courses, gaps..." />
        </div>

        {/* Notification Bell */}
        <div className="notification-wrapper" onClick={() => navigate("/notifications")}>
          <FaBell className="bell-icon" />
          <span className="notification-badge">3</span>
        </div>

        {/* User Profile */}
        <div className="user-profile-menu">
          <div className="profile-pill" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <img
              src="https://i.pravatar.cc/100?img=32"
              alt={storedName}
              className="user-avatar"
            />
            <div className="user-info">
              <span className="user-name">{storedName}</span>
              <span className="user-role">{role}</span>
            </div>
          </div>

          {dropdownOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <strong>{storedName}</strong>
                <p>{storedEmail}</p>
              </div>
              <hr />
              <button onClick={() => { setDropdownOpen(false); navigate("/my-profile"); }}>
                <FaUserCircle /> My Profile
              </button>
              <button onClick={() => { setDropdownOpen(false); navigate("/manager-dashboard"); }}>
                <FaExchangeAlt /> Switch to Manager
              </button>
              <button onClick={() => { setDropdownOpen(false); navigate("/hr-dashboard"); }}>
                <FaExchangeAlt /> Switch to HR Portal
              </button>
              <hr />
              <button className="logout-item" onClick={() => { localStorage.clear(); navigate("/"); }}>
                <FaSignOutAlt /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;