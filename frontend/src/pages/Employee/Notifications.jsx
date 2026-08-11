import React, { useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import { FaBell, FaExclamationTriangle, FaClock, FaCalendarAlt, FaAward, FaCheckDouble, FaCog } from "react-icons/fa";
import "./Notifications.css";

const Notifications = () => {
  const [filter, setFilter] = useState("All");

  const [notificationList, setNotificationList] = useState([
    {
      id: 1,
      title: "Critical Skill Gap Alert: Microservices",
      desc: "Your Microservices proficiency level is below your role benchmark (Required: Advanced, Current: Beginner).",
      time: "2 Hours Ago",
      type: "Gap Alert",
      unread: true,
      icon: <FaExclamationTriangle color="#ef4444" />
    },
    {
      id: 2,
      title: "Training Deadline Reminder: Spring Boot Course",
      desc: "Milestone Module 3 is due in 2 days. Complete your quiz to stay on target.",
      time: "1 Day Ago",
      type: "Reminder",
      unread: true,
      icon: <FaClock color="#f59e0b" />
    },
    {
      id: 3,
      title: "Upcoming Mentorship Session with Rahul Kumar",
      desc: "Your peer mentorship session on 'Spring Security JWT' starts tomorrow at 3:00 PM.",
      time: "2 Days Ago",
      type: "Mentorship",
      unread: true,
      icon: <FaCalendarAlt color="#7c3aed" />
    },
    {
      id: 4,
      title: "Milestone Certificate Achieved!",
      desc: "Congratulations! You successfully completed HTML5 & CSS Responsive Web Design.",
      time: "4 Days Ago",
      type: "Milestone",
      unread: false,
      icon: <FaAward color="#10b981" />
    }
  ]);

  const markAllRead = () => {
    setNotificationList(notificationList.map(n => ({ ...n, unread: false })));
  };

  const markRead = (id) => {
    setNotificationList(notificationList.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const filteredNotifications = notificationList.filter(n => {
    if (filter === "Unread") return n.unread;
    if (filter === "Gap Alert") return n.type === "Gap Alert";
    if (filter === "Reminder") return n.type === "Reminder";
    return true;
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Notifications Center" role="Employee" userName="R Amrutha" />

        <div className="page-container">
          <div className="page-header">
            <div className="page-header-text">
              <h2><FaBell /> Notifications & Alerts Center</h2>
              <p>Stay updated on skill gap alerts, training deadlines, mentorship reminders, and milestone achievements.</p>
            </div>
            <button className="btn btn-secondary" onClick={markAllRead}>
              <FaCheckDouble /> Mark All as Read
            </button>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar">
            <button
              className={`tab-btn ${filter === 'All' ? 'active' : ''}`}
              onClick={() => setFilter('All')}
            >
              All Notifications
            </button>
            <button
              className={`tab-btn ${filter === 'Unread' ? 'active' : ''}`}
              onClick={() => setFilter('Unread')}
            >
              Unread ({notificationList.filter(n => n.unread).length})
            </button>
            <button
              className={`tab-btn ${filter === 'Gap Alert' ? 'active' : ''}`}
              onClick={() => setFilter('Gap Alert')}
            >
              Gap Alerts
            </button>
            <button
              className={`tab-btn ${filter === 'Reminder' ? 'active' : ''}`}
              onClick={() => setFilter('Reminder')}
            >
              Deadlines & Reminders
            </button>
          </div>

          {/* Notifications Feed */}
          <div className="notifications-feed">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                className={`card-box notification-card ${n.unread ? 'unread-card' : ''}`}
                onClick={() => markRead(n.id)}
              >
                <div className="notify-icon-bubble">
                  {n.icon}
                </div>

                <div className="notify-content">
                  <div className="notify-header">
                    <span className="type-tag">{n.type}</span>
                    <span className="notify-time">{n.time}</span>
                  </div>
                  <h3>{n.title}</h3>
                  <p>{n.desc}</p>
                </div>

                {n.unread && <span className="unread-dot"></span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
