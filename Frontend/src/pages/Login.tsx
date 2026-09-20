import { FormEvent, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api, endpoints, getApiErrorMessage } from '../api';
import { loginStore } from '../auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const navigate = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password.trim()) {
      setFieldError('Please enter both your official email and password.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setFieldError('Please enter a valid official email address.');
      return;
    }

    setFieldError('');
    setBusy(true);

    try {
      const response = await api.post(endpoints.login, { officialEmail: trimmedEmail, password });
      const payload = response?.data ?? response?.data?.data ?? {};
      const token = payload?.token ?? null;

      if (!token) {
        throw new Error('Authentication response did not include a token.');
      }

      loginStore(token, payload?.role, payload);
      navigate('/dashboard');
    } catch (err: any) {
      const message = getApiErrorMessage(err, 'Login failed. Check your email and password.');
      const lower = String(message).toLowerCase();

      if (lower.includes('awaiting hr approval') || lower.includes('pending')) {
        setError('Your account is pending HR approval. You will be able to sign in after approval.');
      } else if (lower.includes('rejected') || lower.includes('not approved')) {
        setError('Your registration request was rejected. Please contact HR for more information.');
      } else {
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authPage">
      <div className="authVisual">
        <div className="visualInner">
          <div className="brandRow">
            <div className="logoLarge">OK</div>
            <div className="brandText">OKIP</div>
          </div>

          <div className="brandSubtext">ORGANIZATIONAL KNOWLEDGE GAP</div>
          <div className="brandSubtext secondary">INTELLIGENCE PLATFORM</div>

          <div className="featurePill">AI-powered workforce intelligence</div>

          <h1>
            Bridge the
            <span>Knowledge Gap</span>
          </h1>

          <p>
            Empowering organizations to identify, assess, and close workforce gaps using modern
            competency intelligence.
          </p>

          <div className="featureGrid" style={{ marginTop: 24 }}>
            <div className="featureTile">
              <span className="tileIcon">◌</span>
              <strong>Knowledge Gap Detection</strong>
              <small>Real-time competency mapping</small>
            </div>
            <div className="featureTile">
              <span className="tileIcon">✦</span>
              <strong>AI Learning Recommendations</strong>
              <small>Personalized training paths</small>
            </div>
            <div className="featureTile">
              <span className="tileIcon">◎</span>
              <strong>Workforce Intelligence</strong>
              <small>Deep organizational readiness</small>
            </div>
          </div>

          <div className="securityRow">
            <span>AI Powered • Secure • JWT Authentication</span>
            <span>Security</span>
            <span>Privacy</span>
          </div>
        </div>
      </div>

      <div className="authForm">
        <div className="authCard">
          <h2>Welcome Back</h2>
          <p className="muted" style={{ marginBottom: 24 }}>Sign in to your enterprise intelligence dashboard.</p>

          <form onSubmit={submit} noValidate>
            <label className="field">
              <span>Organization Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                autoComplete="username"
                aria-invalid={Boolean(fieldError || error)}
              />
            </label>

            <div className="field passwordRowField">
              <div className="passwordHeader">
                <span>Password</span>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="inlineLink"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="passwordField">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(fieldError || error)}
                />
                <button type="button" className="passwordToggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {(fieldError || error) && <div className="errorBox">{fieldError || error}</div>}

            <label className="staySignedIn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" defaultChecked />
              <span>Remember active session (24h JWT Security Policy)</span>
            </label>

            <button className="btn primary full" type="submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Access Platform →'}
            </button>
          </form>

          <div className="authFooter">
            <span>New employee? <Link to="/register">Register employee account</Link></span>
          </div>
        </div>
      </div>

      {showForgotModal && (
        <div className="modalOverlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'grid', placeItems: 'center' }}>
          <div className="modalContent" style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 440, width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0 }}>Password Reset Request</h3>
            <p className="muted" style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
              For enterprise security, password resets are managed directly by System Administrators and Human Resources.
            </p>
            <div style={{ background: '#f5f4fb', padding: 14, borderRadius: 12, margin: '16px 0', fontSize: '0.88rem' }}>
              <p style={{ margin: '0 0 6px' }}><b>Contact HR Support:</b> hr@okip.com</p>
              <p style={{ margin: 0 }}><b>Contact Admin:</b> admin@okip.com</p>
            </div>
            <button
              className="btn primary full"
              onClick={() => setShowForgotModal(false)}
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
