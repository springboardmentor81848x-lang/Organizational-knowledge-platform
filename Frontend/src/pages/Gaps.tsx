import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, Sparkles, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { get, post, endpoints, getApiErrorMessage } from '../api';
import { Badge, Button, Card, Empty, ErrorBox, Loading, Stat } from '../components/ui';

export default function Gaps() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [noRole, setNoRole] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    setNoRole(false);
    try {
      const [gap, summary] = await Promise.all([
        get(`${endpoints.gaps}/my`),
        get(`${endpoints.analytics}/my/summary`).catch(() => ({})),
      ]);
      setData({ ...gap, employeeId: summary?.employeeId || gap?.employeeId });
    } catch (e: any) {
      const msg = getApiErrorMessage(e, 'Gap analysis unavailable.');
      if (
        msg.toLowerCase().includes('no active job role') ||
        msg.toLowerCase().includes('job role') ||
        e?.response?.status === 404
      ) {
        setNoRole(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function recalculate() {
    if (!data?.employeeId) {
      load();
      return;
    }
    setRecalculating(true);
    setError('');
    setSuccess('');
    try {
      await post(`${endpoints.gaps}/run/${data.employeeId}`);
      setSuccess('Knowledge gaps successfully recalculated based on current skills and competencies.');
      load();
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Recalculation failed.'));
    } finally {
      setRecalculating(false);
    }
  }

  if (loading) return <Loading />;

  if (noRole) {
    return (
      <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ display: 'inline-grid', width: 64, height: 64, placeItems: 'center', borderRadius: '50%', background: '#fff1d7', color: '#ab6800', marginBottom: 16 }}>
          <AlertTriangle size={32} />
        </div>
        <h2 style={{ fontSize: '1.6rem', marginBottom: 8 }}>No Active Job Role Assigned</h2>
        <p className="muted" style={{ maxWidth: 500, margin: '0 auto 24px', lineHeight: 1.6 }}>
          Knowledge gap analysis calculates competency readiness by comparing your skill inventory against an active target job role. Please contact HR or your Manager to assign your primary job role.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <Button onClick={() => navigate('/skills')}>Update My Skills</Button>
          <Button variant="secondary" onClick={() => navigate('/training')}>Explore Trainings</Button>
        </div>
      </Card>
    );
  }

  const gapsList = data?.knowledgeGaps || [];
  const readiness = Math.round(data?.readinessPercentage || 0);
  const overallGap = Math.round(data?.overallGapPercentage || 0);

  return (
    <>
      <div className="heroRow">
        <div>
          <p className="eyebrow">Competency Intelligence Engine</p>
          <h2>Knowledge Gap Analysis</h2>
          <p className="muted">
            Target Job Role: <b>{data?.jobRoleName || 'Assigned Primary Role'}</b> · Readiness computed from required role competencies vs your verified skills.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={() => navigate('/ai')}>
            <Sparkles size={16} style={{ marginRight: 6 }} /> AI Recommendations
          </Button>
          <Button onClick={recalculate} disabled={recalculating}>
            <RefreshCw size={16} style={{ marginRight: 6, animation: recalculating ? 'spin 1s linear infinite' : 'none' }} />
            {recalculating ? 'Analyzing…' : 'Recalculate Gaps'}
          </Button>
        </div>
      </div>

      {error && <ErrorBox message={error} />}
      {success && <div className="successBox">{success}</div>}

      <div className="statsGrid">
        <Stat label="Overall Gap Score" value={`${overallGap}%`} icon={<AlertTriangle size={20} />} />
        <Stat label="Role Readiness" value={`${readiness}%`} icon={<Target size={20} />} />
        <Stat label="Required Competencies" value={data?.totalSkills ?? 0} icon={<CheckCircle2 size={20} />} />
        <Stat label="Open Gaps" value={data?.gapSkills ?? gapsList.filter((g: any) => g.status !== 'CLOSED').length} icon={<AlertTriangle size={20} />} />
      </div>

      <Card>
        <div className="sectionHead">
          <div>
            <h3>Competency Gap Breakdown</h3>
            <p className="muted">
              {gapsList.length} required competencies evaluated against your skill inventory.
            </p>
          </div>
          <Badge tone={readiness >= 75 ? 'green' : readiness >= 50 ? 'orange' : 'red'}>
            {readiness >= 75 ? 'High Readiness' : readiness >= 50 ? 'Moderate Readiness' : 'Critical Gaps'}
          </Badge>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Skill Name</th>
                <th>Current Level</th>
                <th>Required Level</th>
                <th>Gap Type</th>
                <th>Gap %</th>
                <th>Status</th>
                <th>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {gapsList.map((x: any) => (
                <tr key={x.knowledgeGapId}>
                  <td>
                    <b>{x.skillName}</b>
                  </td>
                  <td>
                    <Badge tone={x.currentProficiency ? 'purple' : 'orange'}>
                      {x.currentProficiency || 'None / Missing'}
                    </Badge>
                  </td>
                  <td>
                    <Badge tone="purple">{x.requiredProficiency}</Badge>
                  </td>
                  <td>
                    <small className="muted" style={{ fontWeight: 600 }}>
                      {x.gapType ? x.gapType.replace('_', ' ') : 'GAP'}
                    </small>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress" style={{ width: 60, height: 6, background: '#eeeaf4', borderRadius: 4, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(100, x.gapPercentage || 0)}%`,
                            background: x.gapPercentage >= 70 ? '#bc2948' : x.gapPercentage >= 40 ? '#ab6800' : '#5847d6',
                          }}
                        />
                      </div>
                      <b>{Math.round(x.gapPercentage || 0)}%</b>
                    </div>
                  </td>
                  <td>
                    <Badge tone={x.status === 'CLOSED' ? 'green' : x.gapPercentage >= 70 ? 'red' : 'orange'}>
                      {x.status || 'OPEN'}
                    </Badge>
                  </td>
                  <td>
                    {x.status === 'CLOSED' ? (
                      <span style={{ color: '#078b67', fontSize: '0.8rem', fontWeight: 700 }}>✓ Met</span>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => navigate('/training')}
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      >
                        Find Training
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!gapsList.length && <Empty text="No open knowledge gaps. You meet all competencies for your assigned job role!" />}
        </div>
      </Card>
    </>
  );
}
