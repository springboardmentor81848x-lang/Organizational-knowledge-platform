import { useState } from 'react';
import { Brain, CheckCircle2, ChevronRight, GraduationCap, Target, Users, X } from 'lucide-react';
import { Button } from './ui';

export function PlatformTour({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to OKGIP',
      icon: <Target size={32} style={{ color: '#5847d6' }} />,
      content:
        'The Organizational Knowledge Gap Intelligence Platform helps teams identify competency shortages, track role readiness, and close gaps through targeted learning and mentorship.',
    },
    {
      title: 'Role-Based Workspace',
      icon: <Users size={32} style={{ color: '#078b67' }} />,
      content:
        'Whether you are an Employee managing personal growth, a Manager analyzing team matrix heatmaps, HR governing workforce readiness, or Admin overseeing taxonomy — your sidebar is tailored to your role.',
    },
    {
      title: 'Skill Inventory & Self-Declared vs Verified',
      icon: <Brain size={32} style={{ color: '#7959ed' }} />,
      content:
        'Skills added manually start as Self-Declared. Submitting skill assessments for manager/peer review upgrades confirmed skills to Verified status and automatically recalculates role gap readiness.',
    },
    {
      title: 'Learning & Mentorship',
      icon: <GraduationCap size={32} style={{ color: '#ab6800' }} />,
      content:
        'Explore mapped catalog courses with external provider links, track milestone progress, or connect with expert peers for 1-on-1 mentorship and live technical sessions.',
    },
  ];

  const current = steps[step];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 380,
        maxWidth: '90vw',
        background: '#ffffff',
        borderRadius: 16,
        boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
        border: '1px solid #e0d7f4',
        padding: 20,
        zIndex: 1000,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {current.icon}
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text)' }}>{current.title}</h4>
            <small className="muted">
              Step {step + 1} of {steps.length}
            </small>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}
          aria-label="Close Tour"
        >
          <X size={18} />
        </button>
      </div>

      <p style={{ fontSize: '0.88rem', color: '#4a4458', lineHeight: 1.5, margin: '0 0 16px' }}>{current.content}</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.82rem', cursor: 'pointer' }}
        >
          Skip Tour
        </button>

        {step < steps.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
            Next <ChevronRight size={14} style={{ marginLeft: 4 }} />
          </Button>
        ) : (
          <Button onClick={onClose} style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
            Got it <CheckCircle2 size={14} style={{ marginLeft: 4 }} />
          </Button>
        )}
      </div>
    </div>
  );
}
