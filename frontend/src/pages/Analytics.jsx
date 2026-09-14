import React from 'react';
import { getStoredUser, roleFamily } from '../services/platformApi';

const Analytics = () => {
  const user = getStoredUser();
  const family = roleFamily(user.role || user.accountType || 'Employee');

  const metrics = [
    { title: 'Workforce Skill Coverage', value: '78.4%', change: '+4.2%', color: '#6366f1' },
    { title: 'Average Gap Reduction Rate', value: '34.1%', change: '+8.0%', color: '#10b981' },
    { title: 'Training Completion Index', value: '89.2%', change: '+2.5%', color: '#ec4899' },
    { title: 'Active Mentorship Hours', value: '428 hrs', change: '+52 hrs', color: '#f59e0b' },
  ];

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <div className="page-hero">
        <div className="page-hero-text">
          <h1>Organizational Analytics & <span className="gradient-text">Competency Insights</span></h1>
          <p>Real-time skill coverage metrics, learning velocity analytics & workforce intelligence reports.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stats-row">
        {metrics.map((m, idx) => (
          <div className="stat-card" key={idx} style={{ borderColor: `${m.color}33` }}>
            <div className="stat-top">
              <span className="stat-title">{m.title}</span>
              <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 'bold' }}>{m.change}</span>
            </div>
            <div className="stat-value" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Visual Analytics Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>📈 Department Skill Coverage Trend</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[
              { name: 'Engineering', score: 84, color: '#6366f1' },
              { name: 'Data Science & AI', score: 76, color: '#a855f7' },
              { name: 'Product & UX', score: 91, color: '#ec4899' },
              { name: 'HR & Talent Ops', score: 88, color: '#10b981' },
              { name: 'Security & DevOps', score: 68, color: '#f59e0b' },
            ].map((d, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                  <span>{d.name}</span>
                  <span style={{ fontWeight: 'bold', color: d.color }}>{d.score}%</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${d.score}%`, height: '100%', background: d.color, borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>🎯 High-Priority Competency Deficits</h3>
          <div style={{ display: 'grid', gap: '0.85rem' }}>
            {[
              { skill: 'Cloud Architecture & Security (AWS/Azure)', gap: '38%', level: 'Critical' },
              { skill: 'Generative AI & Enterprise LLM Deployment', gap: '32%', level: 'High' },
              { skill: 'PostgreSQL Advanced Indexing & Performance', gap: '24%', level: 'Medium' },
              { skill: 'Microservices Design Patterns (Spring Boot)', gap: '18%', level: 'Medium' },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.92rem' }}>{item.skill}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Deficit Gap: {item.gap}</div>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', borderRadius: '12px', background: item.level === 'Critical' ? 'rgba(239,68,68,0.2)' : item.level === 'High' ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.2)', color: item.level === 'Critical' ? '#f87171' : item.level === 'High' ? '#fbbf24' : '#818cf8', fontWeight: 'bold' }}>
                  {item.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
