import { useEffect, useState } from 'react';
import { Building, Mail, Save, User } from 'lucide-react';
import { get, post, put, endpoints, getApiErrorMessage } from '../api';
import { Badge, Button, Card, ErrorBox, Field, Loading, SelectField } from '../components/ui';

export default function Profile() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await get(endpoints.profile);
      setData(res || {});
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Unable to load employee profile.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');

    const payload = {
      phoneNumber: data.phoneNumber || '',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      country: data.country || '',
      pincode: data.pincode || '',
      dateOfBirth: data.dateOfBirth || null,
      gender: data.gender || '',
      bio: data.bio || '',
      availableAsMentor: data.availableAsMentor !== undefined ? data.availableAsMentor : true,
    };

    try {
      let r;
      try {
        r = await put(endpoints.profile, payload);
      } catch {
        r = await post(endpoints.profile, payload);
      }
      setData(r || data);
      setSuccess('Profile updated successfully.');
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Profile save failed.'));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <>
      <div className="heroRow">
        <div>
          <p className="eyebrow">Personal Account Governance</p>
          <h2>My Profile & Credentials</h2>
          <p className="muted">
            Update contact info, address details, and personal summary for organizational directory records.
          </p>
        </div>
      </div>

      {error && <ErrorBox message={error} />}
      {success && <div className="successBox">{success}</div>}

      <div className="grid2">
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <div
              className="avatar huge"
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#5847d6',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontSize: '1.8rem',
                fontWeight: 800,
              }}
            >
              {(data.employeeName?.[0] || 'U').toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{data.employeeName || 'Employee'}</h2>
              <p className="muted" style={{ margin: '2px 0 6px', fontSize: '0.88rem' }}>
                Code: <b>{data.employeeCode || '—'}</b>
              </p>
              <Badge tone="purple">Official Employee Record</Badge>
            </div>
          </div>

          <form onSubmit={save}>
            <div className="formGrid">
              <Field
                label="Phone Number"
                type="tel"
                value={data.phoneNumber || ''}
                onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />

              <SelectField
                label="Gender"
                value={data.gender || ''}
                onChange={(e) => setData({ ...data, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer Not To Say">Prefer Not To Say</option>
              </SelectField>

              <Field
                label="Date of Birth"
                type="date"
                value={data.dateOfBirth || ''}
                onChange={(e) => setData({ ...data, dateOfBirth: e.target.value })}
              />

              <Field
                label="Pincode / Zip"
                value={data.pincode || ''}
                onChange={(e) => setData({ ...data, pincode: e.target.value })}
              />
            </div>

            <div style={{ marginTop: 14 }}>
              <Field
                label="Street Address"
                value={data.address || ''}
                onChange={(e) => setData({ ...data, address: e.target.value })}
                placeholder="123 Corporate Blvd, Suite 400"
              />
            </div>

            <div className="formGrid" style={{ marginTop: 14 }}>
              <Field
                label="City"
                value={data.city || ''}
                onChange={(e) => setData({ ...data, city: e.target.value })}
              />
              <Field
                label="State / Province"
                value={data.state || ''}
                onChange={(e) => setData({ ...data, state: e.target.value })}
              />
              <Field
                label="Country"
                value={data.country || ''}
                onChange={(e) => setData({ ...data, country: e.target.value })}
              />
            </div>

            <div className="field" style={{ marginTop: 14 }}>
              <span>Professional Bio / Summary</span>
              <textarea
                rows={3}
                value={data.bio || ''}
                onChange={(e) => setData({ ...data, bio: e.target.value })}
                placeholder="Brief summary of your professional background, focus areas, and technical expertise..."
                style={{
                  width: '100%',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: '#f5f5f8',
                  padding: '10px 14px',
                  font: 'inherit',
                  color: 'var(--text)',
                }}
              />
            </div>

            <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 12, background: '#f5f4fb', border: '1px solid #e2ddf7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <b style={{ fontSize: '0.95rem', color: '#4331bf' }}>Available as Peer Mentor</b>
                <p className="muted" style={{ margin: '2px 0 0', fontSize: '0.82rem' }}>
                  Allow colleagues to find you in the Expert Directory and request 1-on-1 mentorship.
                </p>
              </div>
              <input
                type="checkbox"
                checked={data.availableAsMentor !== false}
                onChange={(e) => setData({ ...data, availableAsMentor: e.target.checked })}
                style={{ width: 20, height: 20, accentColor: '#5847d6', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <Button type="submit" disabled={busy}>
                <Save size={16} style={{ marginRight: 6 }} /> {busy ? 'Saving…' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <div className="sectionHead">
            <div>
              <h3>Organization Summary</h3>
              <p className="muted">System identity and official employee details.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="listRow">
              <div>
                <small className="muted">System Employee ID</small>
                <p style={{ margin: '2px 0 0', fontWeight: 700 }}>#{data.employeeId || '—'}</p>
              </div>
            </div>

            <div className="listRow">
              <div>
                <small className="muted">Employee Code</small>
                <p style={{ margin: '2px 0 0', fontWeight: 700 }}>{data.employeeCode || '—'}</p>
              </div>
            </div>

            <div className="listRow">
              <div>
                <small className="muted">Official Status</small>
                <p style={{ margin: '4px 0 0' }}>
                  <Badge tone="green">APPROVED & ACTIVE</Badge>
                </p>
              </div>
            </div>

            <div style={{ background: '#f5f4fb', padding: 14, borderRadius: 12, marginTop: 8 }}>
              <h4 style={{ margin: '0 0 6px', fontSize: '0.9rem' }}>Security Policy Note</h4>
              <p className="muted" style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.5 }}>
                Official email address, system roles, and department assignments can only be modified by HR Administration.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
