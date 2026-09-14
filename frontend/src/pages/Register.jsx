import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { JOB_ROLES } from '../data/examData';
import { apiFetch, defaultPermissionsForRole, saveSession, roleFamily } from '../services/platformApi';

const ORGANIZATIONAL_ROLES = [
  { role: 'Employee', icon: '👤', desc: 'Create/update profile, self-assess, close gaps, and grow through learning paths.' },
  { role: 'Team Lead / Manager', icon: '🧭', desc: 'View team coverage, identify gaps, and support team learning.' },
  { role: 'HR Specialist', icon: '🧑‍💼', desc: 'Track workforce intelligence, reporting, and organizational skill health.' },
  { role: 'Department Head', icon: '🏢', desc: 'Lead department readiness, training adoption, and capability planning.' },
  { role: 'Learning & Development Admin/mentor', icon: '🎓', desc: 'Own learning catalogs, personalized learning paths, and completion tracking.' },
  { role: 'System Administrator', icon: '🛡️', desc: 'Manage authentication, roles, users, monitoring, and security.' },
];

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = account info, 2 = role selection
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    accountType: '',
    targetRole: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAccountType = (type) => setForm({ ...form, accountType: type, targetRole: '' });
  const handleTargetRole = (roleId) => setForm({ ...form, targetRole: roleId });

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.accountType) { setError('Please select your account type.'); return; }
    setError('');
    setStep(2);
  };

  const submitForm = async () => {
    if (form.accountType === 'Employee' && !form.targetRole) {
      setError('Please select the role you are targeting.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...form, name: `${form.firstName} ${form.lastName}` }),
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
        navigate(roleFamily(data.user?.role) === 'employee' ? '/employee/assessments' : '/app');
        return;
      }
      throw new Error('backend register failed');
    } catch {
      setTimeout(() => {
        const userData = {
          email: form.email,
          name: `${form.firstName} ${form.lastName}`,
          role: form.accountType,
          targetRole: form.targetRole,
          accountType: form.accountType,
          permissions: defaultPermissionsForRole(form.accountType),
        };
        saveSession({ token: 'demo-token', user: userData });
        setLoading(false);
        navigate(roleFamily(form.accountType) === 'employee' ? '/employee/assessments' : '/app');
      }, 1200);
    }
  };

  const renderStep1 = () => (
    <form onSubmit={handleStep1}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">First Name</label>
          <div className="form-input-wrapper">
            <span className="form-input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg>
            </span>
            <input type="text" name="firstName" className="form-input" placeholder="John" value={form.firstName} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Last Name</label>
          <div className="form-input-wrapper">
            <span className="form-input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg>
            </span>
            <input type="text" name="lastName" className="form-input" placeholder="Doe" value={form.lastName} onChange={handleChange} required />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Work Email</label>
        <div className="form-input-wrapper">
          <span className="form-input-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/><polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/></svg>
          </span>
          <input type="email" name="email" className="form-input" placeholder="you@company.com" value={form.email} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <div className="form-input-wrapper">
          <span className="form-input-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/></svg>
          </span>
          <input type="password" name="password" className="form-input" placeholder="Create a strong password" value={form.password} onChange={handleChange} required />
        </div>
      </div>

      {/* Account Type Selection */}
      <div className="form-group">
        <label className="form-label">I am joining as...</label>
        <div className="account-type-grid">
          {ORGANIZATIONAL_ROLES.map(({ role, icon, desc }) => (
            <button
              key={role}
              type="button"
              className={`account-type-card ${form.accountType === role ? 'selected' : ''}`}
              onClick={() => handleAccountType(role)}
            >
              <div className="account-type-icon">{icon}</div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4, color: form.accountType === role ? '#a5b4fc' : 'var(--text-primary)' }}>{role}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
              </div>
              {form.accountType === role && (
                <div style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#fff', fontWeight: 900 }}>✓</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.65rem 1rem', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '1.25rem' }}>
        <label className="checkbox-group" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <input type="checkbox" required />
          I agree to the <a href="#" className="form-link" style={{ marginLeft: '0.25rem' }}>Terms of Service</a> and <a href="#" className="form-link">Privacy Policy</a>
        </label>
      </div>

      <button type="submit" className="btn-submit">
        {loading ? 'Creating Account...' : 'Continue →'}
      </button>
    </form>
  );

  const renderStep2 = () => (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Step 2 of 2</div>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>What role are you targeting? 🎯</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>We'll build a personalized exam and learning path based on this.</p>
      </div>

      <div className="role-picker-grid">
        {JOB_ROLES.map(role => (
          <button
            key={role.id}
            type="button"
            className={`role-picker-card ${form.targetRole === role.id ? 'selected' : ''}`}
            onClick={() => handleTargetRole(role.id)}
          >
            <span style={{ fontSize: '1.6rem' }}>{role.icon}</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: form.targetRole === role.id ? '#a5b4fc' : 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.3 }}>{role.label}</span>
            {form.targetRole === role.id && (
              <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: '#fff', fontWeight: 900 }}>✓</div>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.65rem 1rem', color: 'var(--danger)', fontSize: '0.85rem', margin: '1rem 0' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
        <button
          type="button"
          onClick={() => { setStep(1); setError(''); }}
          style={{ flex: '0 0 auto', padding: '0.875rem 1.25rem', background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
        >
          ← Back
        </button>
        <button
          type="button"
          className="btn-submit"
          style={{ flex: 1 }}
          disabled={loading}
          onClick={submitForm}
        >
          {loading ? 'Creating Account...' : '🚀 Create Account & Start Exam →'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      {/* Left Visual */}
      <div className="auth-visual">
        <div className="auth-visual-content">
          <div className="auth-visual-icon">{step === 2 ? '🎯' : '🚀'}</div>
          <h2>{step === 2 ? 'Choose Your Path' : 'Join the Intelligence Platform'}</h2>
          <p>
            {step === 2
              ? 'Select your target role and we\'ll generate a personalized skill assessment and learning plan just for you.'
              : 'Set up your account in minutes. Identify skill gaps, get targeted learning plans, and track your growth.'}
          </p>
          <ul className="auth-features-list">
            <li><div className="feature-check">✓</div> Role-based skill assessment</li>
            <li><div className="feature-check">✓</div> AI-powered gap detection</li>
            <li><div className="feature-check">✓</div> Personalized course recommendations</li>
            <li><div className="feature-check">✓</div> Visual progress tracking</li>
            <li><div className="feature-check">✓</div> Admin & Employee dashboards</li>
          </ul>
          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem', justifyContent: 'center' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ height: 4, width: s === step ? 32 : 16, borderRadius: 4, background: s <= step ? '#6366f1' : 'rgba(255,255,255,0.15)', transition: 'all 0.3s' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="auth-form-side">
        <div className="auth-form-box" style={{ maxWidth: step === 2 ? 520 : 430 }}>
          <div className="auth-form-header">
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to Home
            </Link>
            <h1>{step === 2 ? 'Pick Your Target Role ✨' : 'Create your account ✨'}</h1>
            <p>{step === 2 ? 'This determines your assessment and learning path' : 'Start building a smarter career today'}</p>
          </div>

          {step === 1 ? renderStep1() : renderStep2()}

          {step === 1 && (
            <p className="auth-switch">
              Already have an account? <Link to="/login" className="form-link">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
