import { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { get, endpoints, getApiErrorMessage } from '../api';
import { Button, Card, ErrorBox } from '../components/ui';

const reports = [
  { label: 'My Skill Gaps Export', path: '/export/my-gaps', filename: 'my-skill-gaps.csv', desc: 'Personal competency gap breakdown and readiness percentages.' },
  { label: 'Team Skill Gaps Export', path: '/export/team-gaps', filename: 'team-gaps.csv', desc: 'Team-wide skill shortages, risk levels, and employee readiness scores.' },
  { label: 'Department Analytics Export', path: '/export/department-summary', filename: 'department-summary.csv', desc: 'Department readiness comparison and average gap scores.' },
  { label: 'Training Catalog Export', path: '/export/trainings', filename: 'training-catalog.csv', desc: 'Master training offerings, completion rates, and provider catalog.' },
  { label: 'Assessments Export', path: '/export/assessments', filename: 'skill-assessments.csv', desc: 'Verified self, manager, and peer assessment scores and reviews.' },
];

export default function Reports() {
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  async function handleDownload(path: string, filename: string) {
    setDownloading(path);
    setError('');
    try {
      const res = await get(endpoints.reports + path);
      const csvData = typeof res === 'string' ? res : JSON.stringify(res, null, 2);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Failed to generate report export.'));
    } finally {
      setDownloading(null);
    }
  }

  return (
    <>
      <div className="heroRow">
        <div>
          <p className="eyebrow">Data Governance & Analytics</p>
          <h2>Reports & CSV Data Export</h2>
          <p className="muted">
            Export organization, team, and individual skill intelligence data into CSV format for auditing and business analytics.
          </p>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      <Card>
        <div className="sectionHead">
          <div>
            <h3>Available Export Datasets</h3>
            <p className="muted">Generated on-demand using real backend database records.</p>
          </div>
        </div>

        <div className="cardGrid">
          {reports.map((r) => (
            <Card key={r.path} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ padding: 8, borderRadius: 8, background: '#ded7fb', color: '#4331bf' }}>
                  <FileSpreadsheet size={20} />
                </div>
                <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{r.label}</h4>
              </div>

              <p style={{ fontSize: '0.86rem', color: '#4e485e', marginBottom: 16, flex: 1 }}>
                {r.desc}
              </p>

              <Button
                variant="primary"
                disabled={downloading === r.path}
                onClick={() => handleDownload(r.path, r.filename)}
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <Download size={14} style={{ marginRight: 6 }} />
                {downloading === r.path ? 'Generating CSV…' : 'Export CSV'}
              </Button>
            </Card>
          ))}
        </div>
      </Card>
    </>
  );
}
