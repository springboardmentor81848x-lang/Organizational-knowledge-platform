import { FormEvent, useState } from 'react';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, endpoints, getApiErrorMessage } from '../api';

type FormState = {
  firstName: string;
  lastName: string;
  officialEmail: string;
  password: string;
  departmentId: string;
};

const emptyForm: FormState = {
  firstName: '',
  lastName: '',
  officialEmail: '',
  password: '',
  departmentId: '',
};

export default function Register() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState<{ employeeCode?: string; message?: string } | null>(null);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setServerError('');
  }

  function validate() {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.firstName.trim()) nextErrors.firstName = 'First name is required.';
    if (!form.lastName.trim()) nextErrors.lastName = 'Last name is required.';

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.officialEmail.trim()) {
      nextErrors.officialEmail = 'Official email is required.';
    } else if (!emailPattern.test(form.officialEmail.trim())) {
      nextErrors.officialEmail = 'Enter a valid company email address.';
    }

    if (!form.password) {
      nextErrors.password = 'Password is required.';
    } else if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters long.';
    }

    if (!form.departmentId.trim()) {
      nextErrors.departmentId = 'Department ID is required.';
    } else if (Number.isNaN(Number(form.departmentId))) {
      nextErrors.departmentId = 'Department ID must be a number.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setServerError('');
    setSuccess(null);

    if (!validate()) return;

    setBusy(true);

    try {
      const response = await api.post(endpoints.register, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        officialEmail: form.officialEmail.trim(),
        password: form.password,
        departmentId: Number(form.departmentId),
      });

      const payload = response?.data ?? response;
      setSuccess({
        employeeCode: payload?.employeeCode,
        message: payload?.message || 'Registration submitted successfully. Awaiting HR approval.',
      });
      setForm(emptyForm);
    } catch (error: any) {
      setServerError(getApiErrorMessage(error, 'Registration failed. Please try again.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authPage authPageCompact">
      <div className="authVisual">
        <div className="visualInner">
          <div className="logoLarge">OKGIP</div>
          <h1>Join the<br /><span>knowledge network.</span></h1>
          <p>Create your employee account and wait for HR approval before accessing your workspace.</p>
          <div className="loginMetrics">
            <div>
              <b>1</b>
              <small>Account review</small>
            </div>
            <div>
              <b>HR</b>
              <small>Approval flow</small>
            </div>
            <div>
              <b>JWT</b>
              <small>Secure access</small>
            </div>
          </div>
        </div>
      </div>

      <div className="authForm">
        <div className="authCard">
          <div className="miniLogo">OK</div>
          <h2>Create your account</h2>
          <p className="muted">Employee registration is subject to HR approval.</p>

          {success ? (
            <div className="successBox">
              <CheckCircle2 size={20} />
              <div>
                <strong>Registration submitted</strong>
                <p>{success.message}</p>
                {success.employeeCode && <small>Employee code: {success.employeeCode}</small>}
              </div>
            </div>
          ) : null}

          {serverError ? <div className="errorBox">{serverError}</div> : null}

          <form onSubmit={submit} noValidate>
            <div className="formGridAuth">
              <label className="field">
                <span>First name</span>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(event) => updateField('firstName', event.target.value)}
                  aria-invalid={Boolean(errors.firstName)}
                />
                {errors.firstName && <small className="fieldError">{errors.firstName}</small>}
              </label>

              <label className="field">
                <span>Last name</span>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(event) => updateField('lastName', event.target.value)}
                  aria-invalid={Boolean(errors.lastName)}
                />
                {errors.lastName && <small className="fieldError">{errors.lastName}</small>}
              </label>
            </div>

            <label className="field">
              <span>Official email</span>
              <input
                type="email"
                value={form.officialEmail}
                onChange={(event) => updateField('officialEmail', event.target.value)}
                placeholder="you@company.com"
                autoComplete="username"
                aria-invalid={Boolean(errors.officialEmail)}
              />
              {errors.officialEmail && <small className="fieldError">{errors.officialEmail}</small>}
            </label>

            <label className="field">
              <span>Password</span>
              <div className="passwordField">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => updateField('password', event.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.password)}
                />
                <button type="button" className="passwordToggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <small className="fieldError">{errors.password}</small>}
            </label>

            <label className="field">
              <span>Department</span>
              <select
                value={form.departmentId}
                onChange={(event) => updateField('departmentId', event.target.value)}
                aria-invalid={Boolean(errors.departmentId)}
              >
                <option value="">Select Department</option>
                <option value="1">IT / Engineering</option>
                <option value="2">Human Resources (HR)</option>
                <option value="3">Finance & Operations</option>
                <option value="4">Sales & Marketing</option>
              </select>
              {errors.departmentId ? <small className="fieldError">{errors.departmentId}</small> : <small className="fieldHint">Select your assigned organizational department.</small>}
            </label>

            <button className="btn primary full" type="submit" disabled={busy}>
              {busy ? 'Submitting…' : 'Create account'}
            </button>
          </form>

          <div className="authFooter">
            <span>Already registered?</span>
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
