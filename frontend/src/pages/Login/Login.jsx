import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginPersonImg from "../../assets/login_person.jpg";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Google OAuth Modal States
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleStep, setGoogleStep] = useState(1); // 1: Choose Account, 2: Confirm Existing, 3: Enter Custom Primary Details
  const [selectedAccount, setSelectedAccount] = useState({
    firstName: "Amrutha",
    lastName: "R",
    email: "amrutha.r@gmail.com",
    avatar: "https://i.pravatar.cc/100?img=32"
  });

  // Custom Primary Details State for "Use another account"
  const [customForm, setCustomForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Software Developer"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim() === "" || password.trim() === "") {
      alert("Please enter Email and Password");
      return;
    }
    localStorage.setItem("userName", "R Amrutha");
    localStorage.setItem("userEmail", email);
    localStorage.setItem("authProvider", "Password");
    navigate("/employee-dashboard");
  };

  const handleOpenGoogleModal = () => {
    setGoogleStep(1);
    setShowGoogleModal(true);
  };

  const handleSelectExistingAccount = (acc) => {
    setSelectedAccount(acc);
    setGoogleStep(2);
  };

  const handleOpenCustomForm = () => {
    setCustomForm({
      firstName: "",
      lastName: "",
      email: "",
      role: "Software Developer"
    });
    setGoogleStep(3);
  };

  const handleConfirmGoogleSignUp = () => {
    const fullName = `${selectedAccount.firstName} ${selectedAccount.lastName}`.trim();
    localStorage.setItem("userName", fullName || "Google User");
    localStorage.setItem("userEmail", selectedAccount.email);
    localStorage.setItem("authProvider", "Google");
    setShowGoogleModal(false);
    navigate("/employee-dashboard");
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customForm.firstName.trim() || !customForm.email.trim()) {
      alert("Please enter your First Name and Primary Gmail address.");
      return;
    }

    const fullName = `${customForm.firstName} ${customForm.lastName}`.trim();
    localStorage.setItem("userName", fullName);
    localStorage.setItem("userEmail", customForm.email);
    localStorage.setItem("userRole", customForm.role);
    localStorage.setItem("authProvider", "Google OAuth");
    
    setShowGoogleModal(false);
    navigate("/employee-dashboard");
  };

  return (
    <div className="login-page-bg">
      <div className="login-card-container">
        {/* LEFT BLUE BANNER */}
        <div className="login-left-panel">
          <div className="banner-top-content">
            {/* Logo: Book with 4 colorful human figure bars */}
            <div className="logo-box">
              <svg width="72" height="60" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="30" cy="22" r="5" fill="#00C9A7" />
                <circle cx="44" cy="12" r="5" fill="#FFC107" />
                <circle cx="58" cy="8" r="5" fill="#A855F7" />
                <circle cx="72" cy="28" r="5" fill="#38BDF8" />
                <rect x="25" y="30" width="10" height="28" rx="4" fill="#00C9A7" />
                <rect x="39" y="20" width="10" height="38" rx="4" fill="#FFC107" />
                <rect x="53" y="16" width="10" height="42" rx="4" fill="#A855F7" />
                <rect x="67" y="36" width="10" height="22" rx="4" fill="#38BDF8" />
                <path
                  d="M 12 56 C 30 48, 46 54, 50 60 C 54 54, 70 48, 88 56 L 88 64 C 70 56, 54 62, 50 66 C 46 62, 30 56, 12 64 Z"
                  fill="white"
                />
              </svg>
            </div>

            <h1 className="banner-main-title">
              Organizational<br />
              Knowledge Gap<br />
              Intelligence Platform
            </h1>

            <p className="banner-tagline">Identify. Bridge. Grow.</p>
          </div>

          <div className="banner-bottom-illustration">
            <img src={loginPersonImg} alt="Knowledge Gap Illustration" className="illustration-img" />
          </div>
        </div>

        {/* RIGHT WHITE FORM PANEL */}
        <div className="login-right-panel">
          <div className="form-box">
            <div className="form-head">
              <h2>Welcome Back!</h2>
              <p>Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Email Input */}
              <div className="input-row">
                <span className="field-icon-left">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="3"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Input */}
              <div className="input-row">
                <span className="field-icon-left">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="field-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>

              {/* Checkbox & Forgot Password */}
              <div className="remember-forgot-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" className="forgot-link" onClick={(e) => { e.preventDefault(); alert("Password reset link sent."); }}>
                  Forgot Password?
                </a>
              </div>

              {/* Sign In Button */}
              <button type="submit" className="submit-login-btn">
                Sign In
              </button>

              {/* Divider */}
              <div className="form-divider">
                <span>— or —</span>
              </div>

              {/* Google Button */}
              <button
                type="button"
                className="google-sign-btn"
                onClick={handleOpenGoogleModal}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign in with Google</span>
              </button>

              {/* Register Footer */}
              <div className="register-footer">
                Don't have an account? <a href="#register" onClick={(e) => { e.preventDefault(); handleOpenGoogleModal(); }}>Register here</a>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* GOOGLE OAUTH POPUP MODAL */}
      {showGoogleModal && (
        <div className="google-modal-overlay" onClick={() => setShowGoogleModal(false)}>
          <div className="google-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="google-modal-header">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <h3>Sign in with Google</h3>
              <p>Choose an account to continue to <strong>KnowledgeGap.ai</strong></p>
            </div>

            {/* STEP 1: CHOOSE EXISTING GMAIL ACCOUNT OR USE ANOTHER */}
            {googleStep === 1 && (
              <div className="google-account-list">
                <div
                  className="account-item"
                  onClick={() => handleSelectExistingAccount({
                    firstName: "Amrutha",
                    lastName: "R",
                    email: "amrutha.r@gmail.com",
                    avatar: "https://i.pravatar.cc/100?img=32"
                  })}
                >
                  <img src="https://i.pravatar.cc/100?img=32" alt="Amrutha R" className="account-avatar" />
                  <div className="account-details">
                    <strong className="account-name">Amrutha R</strong>
                    <span className="account-email">amrutha.r@gmail.com</span>
                  </div>
                </div>

                <div
                  className="account-item"
                  onClick={() => handleSelectExistingAccount({
                    firstName: "Amrutha",
                    lastName: "Dev",
                    email: "work.amrutha@gmail.com",
                    avatar: "https://i.pravatar.cc/100?img=47"
                  })}
                >
                  <img src="https://i.pravatar.cc/100?img=47" alt="Work Amrutha" className="account-avatar" />
                  <div className="account-details">
                    <strong className="account-name">Work Amrutha</strong>
                    <span className="account-email">work.amrutha@gmail.com</span>
                  </div>
                </div>

                <div
                  className="account-item use-another"
                  onClick={handleOpenCustomForm}
                >
                  <div className="avatar-placeholder">+</div>
                  <div className="account-details">
                    <strong className="account-name" style={{ color: "#2563eb" }}>Use another Google account</strong>
                    <span className="account-email">Enter your primary details (First Name, Email)</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CONFIRM PRE-SELECTED GMAIL ACCOUNT */}
            {googleStep === 2 && (
              <div className="google-profile-confirm">
                <div className="confirm-avatar-box">
                  <img src={selectedAccount.avatar} alt="Profile Avatar" className="confirm-avatar" />
                  <h4>{selectedAccount.firstName} {selectedAccount.lastName}</h4>
                  <p>{selectedAccount.email}</p>
                </div>

                <div className="primary-details-box">
                  <div className="detail-row">
                    <span>First Name:</span>
                    <strong>{selectedAccount.firstName}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Last Name:</span>
                    <strong>{selectedAccount.lastName}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Primary Email:</span>
                    <strong>{selectedAccount.email}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Password Required:</span>
                    <strong style={{ color: "#10b981" }}>No Password Needed (Google OAuth)</strong>
                  </div>
                </div>

                <div className="modal-action-buttons">
                  <button className="btn btn-secondary" onClick={() => setGoogleStep(1)}>
                    Back
                  </button>
                  <button className="btn btn-primary-google" onClick={handleConfirmGoogleSignUp}>
                    Continue as {selectedAccount.firstName}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CUSTOM PRIMARY DETAILS FORM FOR "USE ANOTHER ACCOUNT" */}
            {googleStep === 3 && (
              <form onSubmit={handleCustomSubmit} className="custom-primary-form">
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "10px 14px", borderRadius: "8px", fontSize: "0.85rem", color: "#1e40af", marginBottom: "14px" }}>
                  ℹ️ Enter your primary details below. Your account will be created automatically with Google Single Sign-On. <strong>No password creation needed.</strong>
                </div>

                <div className="modal-input-field">
                  <label>First Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Amrutha"
                    value={customForm.firstName}
                    onChange={(e) => setCustomForm({ ...customForm, firstName: e.target.value })}
                    required
                  />
                </div>

                <div className="modal-input-field">
                  <label>Last Name</label>
                  <input
                    type="text"
                    placeholder="e.g. R"
                    value={customForm.lastName}
                    onChange={(e) => setCustomForm({ ...customForm, lastName: e.target.value })}
                  />
                </div>

                <div className="modal-input-field">
                  <label>Primary Gmail / Email Address *</label>
                  <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={customForm.email}
                    onChange={(e) => setCustomForm({ ...customForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="modal-input-field">
                  <label>Target Role Framework</label>
                  <select
                    value={customForm.role}
                    onChange={(e) => setCustomForm({ ...customForm, role: e.target.value })}
                  >
                    <option value="Software Developer">Software Developer</option>
                    <option value="Senior Software Engineer">Senior Software Engineer</option>
                    <option value="DevOps Lead">DevOps Lead</option>
                    <option value="Full Stack Architect">Full Stack Architect</option>
                  </select>
                </div>

                <div className="modal-action-buttons" style={{ marginTop: "16px" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setGoogleStep(1)}>
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary-google">
                    Create & Continue with Google
                  </button>
                </div>
              </form>
            )}

            <div className="google-modal-footer">
              <small>To continue, Google will share your name, email address, and language preference with KnowledgeGap.ai.</small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;