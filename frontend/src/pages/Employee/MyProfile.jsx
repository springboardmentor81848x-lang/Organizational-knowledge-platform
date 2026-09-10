import React, { useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import { getCurrentUserId } from "../../services/apiService";
import {
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaBriefcase,
  FaCertificate,
  FaGraduationCap,
  FaEdit,
  FaSave,
  FaPlus,
  FaAward,
  FaCheck
} from "react-icons/fa";
import "./MyProfile.css";

const MyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: localStorage.getItem("userName") || "User",
    email: localStorage.getItem("userEmail") || "",
    phone: "+91 98765 43210",
    employeeId: "EMP-1042",
    department: "Software Engineering",
    role: "Software Developer",
    manager: "Jane Smith",
    joiningDate: "15 Jan 2023",
    location: "Bangalore, India"
  });

  const [certifications, setCertifications] = useState([
    { id: 1, name: "AWS Certified Developer Associate", issuer: "Amazon Web Services", date: "Mar 2023", expiry: "Mar 2026" },
    { id: 2, name: "Spring Certified Professional", issuer: "VMware / Broadcom", date: "Nov 2023", expiry: "Lifetime" },
  ]);

  const [experiences, setExperiences] = useState([
    { id: 1, role: "Software Developer", company: "Tech Solutions Inc.", period: "Jan 2023 - Present", desc: "Developing Spring Boot microservices and React dashboards." },
    { id: 2, role: "Associate Developer Trainee", company: "Innovate Labs", period: "Jun 2022 - Dec 2022", desc: "Built REST APIs and frontend components using HTML/CSS/JavaScript." },
  ]);

  // Modal States
  const [showCertModal, setShowCertModal] = useState(false);
  const [newCert, setNewCert] = useState({ name: "", issuer: "", date: "", expiry: "Lifetime" });

  const [showExpModal, setShowExpModal] = useState(false);
  const [newExp, setNewExp] = useState({ role: "", company: "", period: "", desc: "" });

  const handleSave = () => {
    setIsEditing(false);
    alert("Profile details updated successfully!");
  };

  const handleAddCert = (e) => {
    e.preventDefault();
    if (!newCert.name || !newCert.issuer) return;
    setCertifications([...certifications, { id: Date.now(), ...newCert }]);
    setNewCert({ name: "", issuer: "", date: "", expiry: "Lifetime" });
    setShowCertModal(false);
  };

  const handleAddExp = (e) => {
    e.preventDefault();
    if (!newExp.role || !newExp.company) return;
    setExperiences([...experiences, { id: Date.now(), ...newExp }]);
    setNewExp({ role: "", company: "", period: "", desc: "" });
    setShowExpModal(false);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="My Profile" role="Employee" userName={profile.fullName} />

        <div className="page-container">
          {/* Header Card */}
          <div className="profile-header-card">
            <div className="profile-avatar-wrapper">
              <img
                src="https://i.pravatar.cc/150?img=32"
                alt="Profile"
                className="profile-avatar-lg"
              />
              <span className="online-badge"></span>
            </div>

            <div className="profile-main-info">
              <h2>{profile.fullName}</h2>
              <p className="profile-role-tag"><FaBriefcase /> {profile.role} ({profile.department})</p>
              <div className="profile-meta-row">
                <span><FaEnvelope /> {profile.email}</span>
                <span><FaBuilding /> ID: {profile.employeeId}</span>
                <span>Manager: <strong>{profile.manager}</strong></span>
              </div>
            </div>

            <button
              className={`btn ${isEditing ? 'btn-primary' : 'btn-secondary'}`}
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
            >
              {isEditing ? <><FaSave /> Save Profile</> : <><FaEdit /> Edit Profile</>}
            </button>
          </div>

          <div className="profile-grid">
            {/* Left Column - Personal Info */}
            <div className="card-box">
              <div className="card-header">
                <h3><FaUser /> Personal Information</h3>
              </div>
              <div className="info-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Department & Role</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={`${profile.role} - ${profile.department}`}
                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Joining Date</label>
                  <input type="text" disabled value={profile.joiningDate} />
                </div>
              </div>
            </div>

            {/* Right Column - Credentials & Certifications */}
            <div className="profile-right-col">
              {/* Certifications */}
              <div className="card-box">
                <div className="card-header">
                  <h3><FaCertificate /> Certifications & Credentials</h3>
                  <button className="btn btn-sm btn-outline" onClick={() => setShowCertModal(true)}>
                    <FaPlus /> Add Cert
                  </button>
                </div>
                <div className="cert-list">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="cert-item">
                      <div className="cert-icon">
                        <FaAward />
                      </div>
                      <div className="cert-details">
                        <h4>{cert.name}</h4>
                        <p>{cert.issuer} • Issued: {cert.date}</p>
                        <span className="cert-expiry">Expires: {cert.expiry}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Work Experience */}
              <div className="card-box">
                <div className="card-header">
                  <h3><FaGraduationCap /> Work Experience</h3>
                  <button className="btn btn-sm btn-outline" onClick={() => setShowExpModal(true)}>
                    <FaPlus /> Add Experience
                  </button>
                </div>
                <div className="timeline">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <h4>{exp.role}</h4>
                        <span className="company-period">{exp.company} | {exp.period}</span>
                        <p>{exp.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Certification Modal */}
      {showCertModal && (
        <div className="modal-overlay" onClick={() => setShowCertModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Certification</h3>
            <form onSubmit={handleAddCert} style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group">
                <label>Certification Name</label>
                <input
                  type="text"
                  placeholder="e.g. AWS Solutions Architect"
                  value={newCert.name}
                  onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Issuing Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Amazon Web Services, Oracle"
                  value={newCert.issuer}
                  onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Issue Date</label>
                <input
                  type="text"
                  placeholder="e.g. May 2024"
                  value={newCert.date}
                  onChange={(e) => setNewCert({ ...newCert, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Expiration</label>
                <input
                  type="text"
                  placeholder="e.g. May 2027 or Lifetime"
                  value={newCert.expiry}
                  onChange={(e) => setNewCert({ ...newCert, expiry: e.target.value })}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCertModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Certification</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Experience Modal */}
      {showExpModal && (
        <div className="modal-overlay" onClick={() => setShowExpModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Work Experience</h3>
            <form onSubmit={handleAddExp} style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group">
                <label>Job Title / Role</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Developer"
                  value={newExp.role}
                  onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Company / Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Tech Systems Inc."
                  value={newExp.company}
                  onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time Period</label>
                <input
                  type="text"
                  placeholder="e.g. Jan 2021 - Dec 2022"
                  value={newExp.period}
                  onChange={(e) => setNewExp({ ...newExp, period: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description & Key Achievements</label>
                <input
                  type="text"
                  placeholder="e.g. Led React migration project"
                  value={newExp.desc}
                  onChange={(e) => setNewExp({ ...newExp, desc: e.target.value })}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowExpModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Experience</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
