import { useEffect, useState } from 'react';
import { ExternalLink, Plus, ScrollText, Trash2 } from 'lucide-react';
import { get, post, del, endpoints, getApiErrorMessage } from '../api';
import { Badge, Button, Card, Empty, ErrorBox, Field, Loading, Modal } from '../components/ui';

export default function Certifications() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState<any>({
    certificateName: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
  });

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await get(endpoints.certifications);
      setRows(data || []);
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Unable to load certifications.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.certificateName.trim() || !form.issuingOrganization.trim()) {
      setError('Certificate name and issuing organization are required.');
      return;
    }

    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await post(endpoints.certifications, {
        certificateName: form.certificateName.trim(),
        issuingOrganization: form.issuingOrganization.trim(),
        issueDate: form.issueDate || null,
        expiryDate: form.expiryDate || null,
        credentialId: form.credentialId.trim(),
        credentialUrl: form.credentialUrl.trim(),
      });
      setSuccess(`Certification "${form.certificateName}" added successfully.`);
      setForm({
        certificateName: '',
        issuingOrganization: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        credentialUrl: '',
      });
      setShowAddModal(false);
      load();
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Failed to add certification.'));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!window.confirm('Are you sure you want to delete this certification?')) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await del(`${endpoints.certifications}/${id}`);
      setSuccess('Certification removed.');
      load();
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Failed to delete certification.'));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <>
      <div className="heroRow">
        <div>
          <p className="eyebrow">Verified Technical Qualifications</p>
          <h2>My Certifications & Credentials</h2>
          <p className="muted">
            Record industry certifications (AWS, Java, Oracle, CNCF, Azure) to validate skill mastery.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} style={{ marginRight: 6 }} /> Add Certification
        </Button>
      </div>

      {error && <ErrorBox message={error} />}
      {success && <div className="successBox">{success}</div>}

      <div className="cardGrid">
        {rows.map((x: any) => (
          <Card key={x.certificationId} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Badge tone="purple">{x.issuingOrganization}</Badge>
                {x.credentialUrl ? (
                  <Badge tone="green">✓ Verified Proof</Badge>
                ) : x.credentialId ? (
                  <Badge tone="orange">Credential ID Provided</Badge>
                ) : (
                  <Badge tone="purple">Self-Reported</Badge>
                )}
              </div>
              <button
                className="iconBtn"
                title="Delete certification"
                onClick={() => remove(x.certificationId)}
                style={{ color: '#bc2948', borderColor: '#f3c7d1' }}
              >
                <Trash2 size={15} />
              </button>
            </div>

            <h3 style={{ fontSize: '1.15rem', margin: '6px 0 4px', lineHeight: 1.3 }}>{x.certificateName}</h3>
            <p className="muted" style={{ fontSize: '0.85rem', margin: '0 0 12px' }}>
              Issued: {x.issueDate || '—'} · Expires: {x.expiryDate || 'Lifetime'}
            </p>

            {x.credentialId && (
              <p style={{ fontSize: '0.82rem', color: '#555', margin: '0 0 12px' }}>
                Credential ID: <code>{x.credentialId}</code>
              </p>
            )}

            <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              {x.credentialUrl ? (
                <a
                  className="btn secondary"
                  href={x.credentialUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ width: '100%', textAlign: 'center', padding: '6px 10px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                >
                  Verify Credential <ExternalLink size={12} />
                </a>
              ) : (
                <span className="muted" style={{ fontSize: '0.78rem' }}>Verified Internal Credential</span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {!rows.length && <Empty text="No certifications added yet. Record your industry credentials to boost your readiness profile!" />}

      <Modal open={showAddModal} title="Add Industry Certification" onClose={() => setShowAddModal(false)}>
        <form onSubmit={save}>
          <Field
            label="Certification Name *"
            value={form.certificateName}
            onChange={(e) => setForm({ ...form, certificateName: e.target.value })}
            placeholder="e.g. AWS Certified Solutions Architect"
            required
          />

          <Field
            label="Issuing Organization *"
            value={form.issuingOrganization}
            onChange={(e) => setForm({ ...form, issuingOrganization: e.target.value })}
            placeholder="e.g. Amazon Web Services / Oracle / Microsoft"
            required
          />

          <div className="formGridAuth">
            <Field
              label="Issue Date"
              type="date"
              value={form.issueDate}
              onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
            />
            <Field
              label="Expiry Date (Optional)"
              type="date"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            />
          </div>

          <div className="formGridAuth">
            <Field
              label="Credential ID"
              value={form.credentialId}
              onChange={(e) => setForm({ ...form, credentialId: e.target.value })}
              placeholder="e.g. AWS-1029384"
            />
            <Field
              label="Verification URL"
              type="url"
              value={form.credentialUrl}
              onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })}
              placeholder="https://credly.com/badges/..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
            <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save Certification'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
