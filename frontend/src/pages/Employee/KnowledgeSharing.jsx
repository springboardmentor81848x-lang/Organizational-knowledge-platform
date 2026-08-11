import React, { useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import { FaHandsHelping, FaUserFriends, FaCalendarAlt, FaStar, FaSearch, FaPlus, FaComments } from "react-icons/fa";
import "./KnowledgeSharing.css";

const KnowledgeSharing = () => {
  const [activeTab, setActiveTab] = useState("mentors");
  const [searchTerm, setSearchTerm] = useState("");

  const mentors = [
    {
      id: 1,
      name: "Rahul Kumar",
      role: "Senior Microservices Architect",
      department: "Cloud Engineering",
      avatar: "https://i.pravatar.cc/100?img=12",
      expertIn: ["Java", "Spring Boot", "Kafka"],
      learns: ["Kubernetes", "Rust"],
      matchScore: "98% Match",
      rating: 4.9,
      sessionsCount: 14
    },
    {
      id: 2,
      name: "Sneha Patil",
      role: "DevOps & Cloud Specialist",
      department: "Infrastructure",
      avatar: "https://i.pravatar.cc/100?img=47",
      expertIn: ["Docker", "AWS", "CI/CD Pipeline"],
      learns: ["Spring Security", "React"],
      matchScore: "92% Match",
      rating: 4.8,
      sessionsCount: 22
    },
    {
      id: 3,
      name: "Vikram Malhotra",
      role: "Lead Frontend Engineer",
      department: "UI/UX Platform",
      avatar: "https://i.pravatar.cc/100?img=60",
      expertIn: ["React", "TypeScript", "UI Performance"],
      learns: ["System Design", "GraphQL"],
      matchScore: "85% Match",
      rating: 4.9,
      sessionsCount: 19
    }
  ];

  const sessions = [
    {
      id: 1,
      topic: "Deep Dive into Spring Boot 3 & JWT Security",
      host: "Rahul Kumar",
      date: "14 May 2024",
      time: "3:00 PM - 4:00 PM IST",
      attendees: 18,
      status: "Upcoming"
    },
    {
      id: 2,
      topic: "Containerizing Spring Applications with Docker",
      host: "Sneha Patil",
      date: "18 May 2024",
      time: "4:30 PM - 5:30 PM IST",
      attendees: 25,
      status: "Upcoming"
    }
  ];

  const handleBookSession = (mentorName) => {
    alert(`Mentorship session request sent to ${mentorName}! They will confirm via email/calendar.`);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Knowledge Sharing & Mentorship" role="Employee" userName="R Amrutha" />

        <div className="page-container">
          <div className="page-header">
            <div className="page-header-text">
              <h2><FaHandsHelping /> Peer Mentorship & Expert Directory</h2>
              <p>Connect with internal subject matter experts based on skill complementarity and schedule knowledge sharing sessions.</p>
            </div>
            <button className="btn btn-primary" onClick={() => alert("Host a knowledge sharing session modal opened!")}>
              <FaPlus /> Host Session
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="assessment-tabs">
            <button
              className={`tab-btn ${activeTab === 'mentors' ? 'active' : ''}`}
              onClick={() => setActiveTab('mentors')}
            >
              <FaUserFriends /> Expert Directory & Mentors
            </button>
            <button
              className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              <FaCalendarAlt /> Knowledge Sharing Sessions ({sessions.length})
            </button>
          </div>

          {activeTab === "mentors" && (
            <>
              {/* Search */}
              <div className="filter-bar">
                <div className="navbar-search" style={{ margin: 0 }}>
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search expert by skill or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Mentor Cards Grid */}
              <div className="mentors-grid">
                {mentors.map((mentor) => (
                  <div key={mentor.id} className="card-box mentor-card">
                    <div className="mentor-card-top">
                      <img src={mentor.avatar} alt={mentor.name} className="mentor-avatar" />
                      <div className="mentor-header-info">
                        <h3>{mentor.name}</h3>
                        <p>{mentor.role}</p>
                        <span className="dept">{mentor.department}</span>
                      </div>
                      <span className="match-pill">{mentor.matchScore}</span>
                    </div>

                    <div className="skills-exchange">
                      <div className="exchange-col">
                        <label>Teaches / Expert In:</label>
                        <div className="tag-cloud">
                          {mentor.expertIn.map((s, i) => (
                            <span key={i} className="badge-pill green">{s}</span>
                          ))}
                        </div>
                      </div>

                      <div className="exchange-col">
                        <label>Wants to Learn:</label>
                        <div className="tag-cloud">
                          {mentor.learns.map((s, i) => (
                            <span key={i} className="badge-pill blue">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mentor-card-footer">
                      <span className="mentor-rating"><FaStar color="#f59e0b" /> {mentor.rating} ({mentor.sessionsCount} sessions)</span>
                      <button className="btn btn-primary btn-sm" onClick={() => handleBookSession(mentor.name)}>
                        <FaComments /> Connect & Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "sessions" && (
            <div className="sessions-list">
              {sessions.map((s) => (
                <div key={s.id} className="card-box session-card">
                  <div className="session-icon">
                    <FaCalendarAlt color="#7c3aed" />
                  </div>
                  <div className="session-details">
                    <span className="badge-pill purple">{s.status}</span>
                    <h3>{s.topic}</h3>
                    <p>Hosted by <strong>{s.host}</strong> • {s.date} ({s.time})</p>
                    <span className="attendee-count"><FaUserFriends /> {s.attendees} Registered Peers</span>
                  </div>
                  <button className="btn btn-outline" onClick={() => alert(`RSVP confirmed for session: ${s.topic}`)}>
                    RSVP / Join Session
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeSharing;
