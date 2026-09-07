import { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, Filter } from 'lucide-react';
import { get, put, endpoints, getApiErrorMessage } from '../api';
import { Badge, Button, Card, Empty, ErrorBox, Loading } from '../components/ui';

export default function Notifications() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await get(`${endpoints.notifications}/my`);
      setRows(data || []);
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Unable to load notifications.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markAsRead(id: number) {
    setBusy(true);
    try {
      await put(`${endpoints.notifications}/${id}/read`);
      load();
    } catch {
      // Ignore fallback
    } finally {
      setBusy(false);
    }
  }

  async function markAllAsRead() {
    setBusy(true);
    try {
      await put(`${endpoints.notifications}/read-all`);
      load();
    } catch {
      // Ignore fallback
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading />;

  const filtered = rows.filter((r) => (filter === 'UNREAD' ? !r.read : true));
  const unreadCount = rows.filter((r) => !r.read).length;

  return (
    <>
      <div className="heroRow">
        <div>
          <p className="eyebrow">Real-Time Platform Alerts</p>
          <h2>Notifications & System Alerts</h2>
          <p className="muted">
            Updates on mentorship requests, course progress milestones, skill assessments, and knowledge sessions.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={markAllAsRead} disabled={busy}>
            <CheckCheck size={16} style={{ marginRight: 6 }} /> Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {error && <ErrorBox message={error} />}

      <Card>
        <div className="sectionHead">
          <div>
            <h3>Activity Inbox</h3>
            <p className="muted">{unreadCount} unread alert(s)</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant={filter === 'ALL' ? 'primary' : 'secondary'}
              onClick={() => setFilter('ALL')}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              All Notifications ({rows.length})
            </Button>
            <Button
              variant={filter === 'UNREAD' ? 'primary' : 'secondary'}
              onClick={() => setFilter('UNREAD')}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              Unread ({unreadCount})
            </Button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((x) => (
            <div
              key={x.notificationId}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: 16,
                borderRadius: 12,
                border: x.read ? '1px solid var(--border)' : '1px solid #c2b8f7',
                background: x.read ? '#ffffff' : '#f8f7fe',
              }}
            >
              <div style={{ flex: 1, paddingRight: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Badge tone={x.read ? 'purple' : 'orange'}>{x.type || 'SYSTEM'}</Badge>
                  {!x.read && <Badge tone="red">NEW</Badge>}
                  <small className="muted" style={{ fontSize: '0.78rem' }}>
                    {x.createdAt ? new Date(x.createdAt).toLocaleString() : 'Recently'}
                  </small>
                </div>
                <h4 style={{ margin: '4px 0 2px', fontSize: '1rem' }}>{x.title}</h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#4e485e', lineHeight: 1.4 }}>{x.message}</p>
              </div>

              {!x.read && (
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() => markAsRead(x.notificationId)}
                  style={{ padding: '4px 10px', fontSize: '0.78rem', flexShrink: 0 }}
                >
                  <Check size={14} style={{ marginRight: 4 }} /> Mark Read
                </Button>
              )}
            </div>
          ))}

          {!filtered.length && <Empty text={filter === 'UNREAD' ? 'No unread notifications.' : 'Your notification inbox is empty.'} />}
        </div>
      </Card>
    </>
  );
}
