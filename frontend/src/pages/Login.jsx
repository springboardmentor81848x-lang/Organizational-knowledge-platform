
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
  e.preventDefault();

  if (email.trim() === "" || password.trim() === "") {
    alert("Please enter Email and Password");
    return;
  }

  console.log("Login Successful");

  navigate("/employee-dashboard");
};

  return (
    <div className="login-card">
      {/* LEFT BANNER SECTION */}
      <div className="login-banner">
        <div className="banner-bg-dots"></div>

        <div className="banner-content">
          <div className="logo-container">
            <svg width="60" height="50" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="25" y="32" width="10" height="28" rx="5" fill="#00C9A7" />
              <rect x="39" y="20" width="10" height="40" rx="5" fill="#FFC107" />
              <rect x="53" y="15" width="10" height="45" rx="5" fill="#A855F7" />
              <rect x="67" y="38" width="10" height="22" rx="5" fill="#38BDF8" />
              <path
                d="M 15 58 C 30 52, 45 58, 50 63 C 55 58, 70 52, 85 58 L 85 64 C 70 58, 55 64, 50 68 C 45 64, 30 58, 15 64 Z"
                fill="white"
              />
            </svg>
          </div>

          <h1 className="banner-title">
            Organizational<br />
            Knowledge Gap<br />
            Intelligence Platform
          </h1>

          <p className="banner-subtitle">Identify. Bridge. Grow.</p>
        </div>

        <div className="banner-illustration">
          <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="illustration-svg">
            <path d="M 30 220 L 110 220 L 110 180 L 30 180 Z" fill="#2563EB" />
            <path d="M 60 180 L 140 180 L 140 140 L 60 140 Z" fill="#3B82F6" />
            <path d="M 90 140 L 170 140 L 170 100 L 90 100 Z" fill="#60A5FA" />
            
            <circle cx="120" cy="75" r="10" fill="#FFD1B3" />
            <path d="M 115 85 Q 120 85 125 85 L 130 115 L 110 115 Z" fill="#1E40AF" />
            <path d="M 110 115 L 135 115 L 145 135 L 100 135 Z" fill="#1E3A8A" />
            
            <polygon points="128,105 142,105 145,112 125,112" fill="#334155" />
            
            <path d="M 310 215 L 330 215 L 326 185 L 314 185 Z" fill="#93C5FD" />
            <ellipse cx="320" cy="165" rx="8" ry="20" fill="#10B981" />
            <ellipse cx="308" cy="175" rx="16" ry="8" fill="#059669" transform="rotate(-20 308 175)" />
            <ellipse cx="332" cy="175" rx="16" ry="8" fill="#059669" transform="rotate(20 332 175)" />
            <ellipse cx="320" cy="150" rx="6" ry="14" fill="#34D399" />
          </svg>
        </div>
      </div>

      {/* RIGHT FORM SECTION */}
      <div className="login-form-container">
        <div className="form-header">
          <h2>Welcome Back!</h2>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
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

          <div className="input-group">
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="forgot-password">
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="btn-submit">
            Sign In
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          <button type="button" className="btn-google">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign in with Google</span>
          </button>

          <div className="form-footer">
            Don't have an account? <a href="#register">Register here</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;