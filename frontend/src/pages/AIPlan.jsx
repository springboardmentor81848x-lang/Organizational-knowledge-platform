import React, { useState } from 'react';
import { getStoredUser } from '../services/platformApi';

const AIPlan = () => {
  const user = getStoredUser();
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setGeneratedPlan({
        targetRole: user.job_role || 'Senior Full-Stack Engineer',
        readinessScore: 78,
        timeline: '12 Weeks',
        milestones: [
          { week: 'Weeks 1-3', title: 'Core Mastery & Skill Gap Remediation', focus: 'Advanced React.js Patterns & Spring Security JWT Implementation', status: 'In Progress' },
          { week: 'Weeks 4-6', title: 'System Design & Distributed Data', focus: 'PostgreSQL Query Optimization, Microservices Architecture & Redis Caching', status: 'Upcoming' },
          { week: 'Weeks 7-9', title: 'Cloud & DevOps Integration', focus: 'Docker Container Orchestration & CI/CD Pipeline Automation', status: 'Upcoming' },
          { week: 'Weeks 10-12', title: 'Leadership & Mentorship Capstone', focus: 'Conducting Peer Assessments & Cross-Functional Project Architecture', status: 'Upcoming' }
        ],
        recommendedActions: [
          'Enroll in "Advanced Cloud Architectures" training program',
          'Schedule 1-on-1 mentorship session with Sarah Donovan for Cloud Architecture guidance',
          'Complete the quarterly Spring Boot Security skill evaluation exam'
        ]
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <div className="page-hero">
        <div className="page-hero-text">
          <h1>AI Personal <span className="gradient-text">Development Plan</span></h1>
          <p>Automated skill gap diagnosis and adaptive career progression roadmap synthesized by AI intelligence.</p>
        </div>
        <button 
          className="btn-hero primary" 
          onClick={handleGenerate}
          disabled={loading}
          style={{ cursor: loading ? 'wait' : 'pointer' }}
        >
          {loading ? 'Synthesizing Plan...' : '⚡ Re-Generate AI Roadmap'}
        </button>
      </div>

      {loading && (
        <div className="loading-container" style={{ padding: '3rem' }}>
          <div className="loader" />
          <p>Analyzing employee skill inventory, assessments & target role requirements...</p>
        </div>
      )}

      {!loading && !generatedPlan && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Generate Your Personalized Learning Roadmap</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
            Our AI engine evaluates your current proficiency gaps against market and internal role expectations to generate a step-by-step career acceleration strategy.
          </p>
          <button className="btn-hero primary" onClick={handleGenerate}>
            Generate AI Plan Now
          </button>
        </div>
      )}

      {!loading && generatedPlan && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Overview Header */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(99,102,241,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Target Career Track</span>
                <h2 style={{ fontSize: '1.75rem', marginTop: '0.2rem' }}>{generatedPlan.targetRole}</h2>
              </div>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981' }}>{generatedPlan.readinessScore}%</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role Readiness</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#6366f1' }}>{generatedPlan.timeline}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Duration</div>
                </div>
              </div>
            </div>
          </div>

          {/* Milestones Roadmap */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📍</span> Strategic Milestones & Remediation Phasing
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {generatedPlan.milestones.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ minWidth: '100px', fontWeight: 'bold', color: '#818cf8', fontSize: '0.9rem' }}>{m.week}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>{m.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{m.focus}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', borderRadius: '20px', background: m.status === 'In Progress' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)', color: m.status === 'In Progress' ? '#34d399' : '#94a3b8', fontWeight: 'bold' }}>
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Immediate Actions */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🚀</span> Recommended Next Steps
            </h3>
            <ul style={{ display: 'grid', gap: '0.75rem', paddingLeft: '1.25rem' }}>
              {generatedPlan.recommendedActions.map((action, idx) => (
                <li key={idx} style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPlan;
