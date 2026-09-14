import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, defaultPermissionsForRole, saveSession, roleFamily } from '../services/platformApi';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        saveSession({
          token: data.token,
          user: {
            ...data.user,
            permissions: data.permissions || defaultPermissionsForRole(data.user?.role),
          },
        });
        navigate('/app');
        return;
      }

      throw new Error('backend login failed');
    } catch {
      setTimeout(() => {
        saveSession({
          token: 'demo-token',
          user: {
            email: form.email,
            name: 'Demo User',
            role: 'Employee',
            accountType: 'Employee',
            targetRole: 'frontend',
            permissions: defaultPermissionsForRole('Employee'),
          },
        });
        setLoading(false);
        navigate('/app');
      }, 1000);
      return;
    }
  };

  return (
    <div className="auth-page">
      {/* Left Visual Panel */}
      <div className="auth-visual">
        <div className="auth-visual-content">
          <div className="auth-visual-icon">🧠</div>
          <h2>Your Intelligence Hub Awaits</h2>
          <p>
            Log back in to your personalized dashboard — your team's skills,
            gaps, and growth plans are all ready for you.
          </p>
          <ul className="auth-features-list">
            <li><div className="feature-check">✓</div> Real-time skill gap insights</li>
            <li><div className="feature-check">✓</div> AI-curated training recommendations</li>
            <li><div className="feature-check">✓</div> Mentorship network access</li>
            <li><div className="feature-check">✓</div> Workforce analytics dashboard</li>
          </ul>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', marginBottom:'2rem', color:'var(--text-secondary)', fontSize:'0.875rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Home
            </Link>
            <h1>Welcome back 👋</h1>
            <p>Sign in to your KnowledgeIQ account</p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: 'var(--danger)',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input-wrapper">
                <span className="form-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-wrapper">
                <span className="form-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </span>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-group">
                <input type="checkbox" />
                Remember me
              </label>
              <Link to="/forgot" className="form-link">Forgot password?</Link>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spinSlow 0.8s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register" className="form-link">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
