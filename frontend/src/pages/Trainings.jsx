import React, { useEffect, useState } from 'react';
import { SKILL_COURSES } from '../data/examData';
import { buildLearningResources } from '../services/learningResources';
import { apiFetch, courseFetch, getStoredUser, roleFamily } from '../services/platformApi';
import { enrollInProgram } from '../services/enrollments';

const courses = [
  {
    emoji: '☁️', bg: 'linear-gradient(135deg,#1e1b4b,#312e81)',
    title: 'Advanced Cloud Architectures (AWS + Azure)',
    provider: 'Internal Engineering', duration: '12h', level: 'Advanced',
    tags: ['urgent','hot'], tagLabels: ['High Priority','Trending'],
    enrolled: 142, rating: 4.8, matchScore: 98,
  },
  {
    emoji: '🤖', bg: 'linear-gradient(135deg,#1a1033,#2d1b69)',
    title: 'Generative AI for Business Professionals',
    provider: 'Coursera Enterprise', duration: '4h', level: 'Beginner',
    tags: ['hot','new'], tagLabels: ['Trending','New'],
    enrolled: 389, rating: 4.9, matchScore: 92,
  },
  {
    emoji: '📊', bg: 'linear-gradient(135deg,#0f1f0f,#064e3b)',
    title: 'Advanced Data Visualization with Tableau',
    provider: 'Udemy Business', duration: '8h', level: 'Mid',
    tags: ['new'], tagLabels: ['New'],
    enrolled: 67, rating: 4.5, matchScore: 85,
  },
  {
    emoji: '🐍', bg: 'linear-gradient(135deg,#1a2c0f,#14532d)',
    title: 'Predictive Analytics with Python & Scikit-learn',
    provider: 'LinkedIn Learning', duration: '10h', level: 'Advanced',
    tags: ['urgent'], tagLabels: ['Critical Gap'],
    enrolled: 44, rating: 4.7, matchScore: 88,
  },
  {
    emoji: '🔐', bg: 'linear-gradient(135deg,#1f0f0f,#7f1d1d)',
    title: 'Cybersecurity & Compliance Fundamentals 2026',
    provider: 'Internal HR', duration: '6h', level: 'Beginner',
    tags: ['urgent'], tagLabels: ['Mandatory'],
    enrolled: 450, rating: 4.3, matchScore: 76,
  },
  {
    emoji: '🎨', bg: 'linear-gradient(135deg,#1a0f2e,#4c1d95)',
    title: 'UX Research Methods & Usability Testing',
    provider: 'Google via Coursera', duration: '15h', level: 'Mid',
    tags: ['new'], tagLabels: ['New'],
    enrolled: 23, rating: 4.6, matchScore: 79,
  },
];

const Trainings = () => {
  const [filter, setFilter] = useState('All');
  const [roleRecommendations, setRoleRecommendations] = useState([]);
  const user = getStoredUser();
  const gapSkills = Object.entries(user.examResults || {})
    .filter(([, value]) => value.level !== 'strong')
    .map(([skill, value]) => ({ skill, ...value }));

  const [trainingCatalog, setTrainingCatalog] = useState([]);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const res = await courseFetch(`/learning-paths?role=${encodeURIComponent(user.role || user.accountType || 'Employee')}&email=${encodeURIComponent(user.email || '')}&limit=6`);
        if (!res.ok) {
          return;
        }

        const data = await res.json();
        setRoleRecommendations(Array.isArray(data.recommendedCourses) ? data.recommendedCourses : []);
      } catch {
        setRoleRecommendations([]);
      }
    };

    const loadPrograms = async () => {
      try {
        const res = await apiFetch('/training-programs');
        if (!res.ok) return;
        const data = await res.json();
        setTrainingCatalog(Array.isArray(data) ? data : []);
      } catch {
        setTrainingCatalog([]);
      }
    };

    loadRecommendations();
    loadPrograms();
  }, [user.email, user.role, user.accountType]);

  const levels = ['All', 'Beginner', 'Mid', 'Advanced'];

  const toCourseCard = (course, skill, level, gap) => ({
    ...course,
    skill,
    gapLevel: level,
    gap,
    bg: course.bg || 'linear-gradient(135deg,#1a1a1a,#2d2d2d)',
    tags: course.tags || (level === 'critical' ? ['urgent'] : ['new']),
    tagLabels: course.tagLabels || (level === 'critical' ? ['Critical Gap'] : ['Recommended']),
    enrolled: course.enrolled || 0,
    rating: course.rating || 4.5,
    matchScore: course.matchScore || Math.max(80, 100 - gap),
  });

  const personalizedCourses = gapSkills.flatMap(({ skill, level, gap }) => {
    const mappedCourses = SKILL_COURSES[skill] || [];
    return mappedCourses.map(course => toCourseCard(course, skill, level, gap));
  });

  const apiCourses = roleRecommendations.map(course => ({
    emoji: '🎯',
    bg: 'linear-gradient(135deg,#132238,#0f172a)',
    title: course.title,
    provider: course.provider,
    duration: course.duration || `${course.durationHours || 0}h`,
    level: course.matchScore >= 85 ? 'Advanced' : course.matchScore >= 65 ? 'Mid' : 'Beginner',
    tags: ['new'],
    tagLabels: [course.source || 'Recommended'],
    enrolled: 0,
    rating: 4.7,
    matchScore: course.matchScore || 80,
    skill: course.category,
    url: course.url,
  }));

  const openLearningPage = (skill) => {
    const resource = buildLearningResources(skill)[0];
    if (resource?.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  const [enrolling, setEnrolling] = useState(null);

  const enrollCourse = async (course) => {
    setEnrolling(course.title);
    const payload = {
      employeeEmail: user.email,
      programId: course.id || null,
      programTitle: course.title,
      provider: course.provider,
      status: 'enrolled'
    };
    const res = await enrollInProgram(payload);
    setEnrolling(null);
    if (res) {
      alert('Enrolled: ' + course.title);
    } else {
      alert('Failed to enroll.');
    }
  };

  const fallbackCourses = gapSkills.length > 0 ? personalizedCourses : courses;
  const renderedCourses = apiCourses.length > 0 ? apiCourses : fallbackCourses;
  const filtered = filter === 'All' ? renderedCourses : renderedCourses.filter(c => c.level === filter);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Learning & Trainings</div>
          <div className="page-sub">{gapSkills.length > 0 ? 'Training paths matched to your assessment gaps' : `AI-matched courses for ${roleFamily(user.role || user.accountType || 'Employee')} roles`}</div>
        </div>
        <button className="btn-primary" style={{ padding:'0.6rem 1.25rem', borderRadius:8 }}>
          + Recommend Course
        </button>
      </div>

      {gapSkills.length > 0 && (
        <div style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem', borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)' }}>
          <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Recommended for your gaps</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            You are weak in {gapSkills.map(s => s.skill).join(', ')}. These courses and resources are sorted to close those gaps first.
          </div>
        </div>
      )}

      {gapSkills.length > 0 && (
        <div className="gap-learning-stack">
          {gapSkills.map(({ skill, score, gap, level }) => (
            <div key={skill} className={`gap-learning-card ${level === 'critical' ? 'critical' : 'moderate'}`}>
              <div className="gap-learning-head">
                <div>
                  <div className="gap-learning-title">{skill}</div>
                  <div className="gap-learning-subtitle">Current score {score}% • {gap}% gap</div>
                </div>
                <span className={`gap-learning-badge ${level === 'critical' ? 'critical' : 'moderate'}`}>
                  {level === 'critical' ? 'Critical priority' : 'Needs improvement'}
                </span>
              </div>
              <div className="gap-learning-resources">
                {buildLearningResources(skill).map(resource => (
                  <a
                    key={`${skill}-${resource.provider}`}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-learning-resource"
                  >
                    <span>{resource.provider}</span>
                    <span>{resource.type}</span>
                  </a>
                ))}
              </div>
              <button className="gap-learning-action" onClick={() => openLearningPage(skill)}>
                Start learning {skill} →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'flex', gap:'1rem', marginBottom:'1.75rem' }}>
        {[
          { label:'Available Courses', value: courses.length, icon:'📚' },
          { label:'Active Learners',   value:'1,894',          icon:'🎓' },
          { label:'Avg. Completion',   value:'74%',            icon:'✅' },
          { label:'Hours Logged',      value:'12.4k',          icon:'⏱' },
        ].map((s,i) => (
          <div key={i} className="card" style={{ flex:1, textAlign:'center', padding:'1.25rem' }}>
            <div style={{ fontSize:'1.75rem', marginBottom:'0.4rem' }}>{s.icon}</div>
            <div className="stat-value" style={{ fontSize:'1.5rem' }}>{s.value}</div>
            <div className="stat-title" style={{ marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="filters-row">
        {levels.map(l => (
          <button key={l} className={`filter-chip ${filter===l?'active':''}`} onClick={() => setFilter(l)}>{l}</button>
        ))}
      </div>

      <div className="trainings-grid">
        {filtered.map((c, i) => (
          <div className="training-card" key={i} style={{ animationDelay:`${i*0.06}s` }}>
            <div className="training-thumb" style={{ background: c.bg }}>
              <span style={{ fontSize:'3rem' }}>{c.emoji}</span>
              <div style={{
                position:'absolute', top:10, right:10,
                background:'rgba(0,0,0,0.4)', backdropFilter:'blur(8px)',
                borderRadius:50, padding:'3px 10px',
                fontSize:'0.72rem', fontWeight:700, color:'#a5b4fc',
                border:'1px solid rgba(99,102,241,0.3)',
              }}>
                {c.matchScore}% match
              </div>
            </div>
            <div className="training-body">
              {c.skill && <div className="training-focus-pill">Gap focus: {c.skill}</div>}
              <div className="training-tags">
                {c.tags.map((t, ti) => (
                  <span key={ti} className={`tag ${t}`}>{c.tagLabels[ti]}</span>
                ))}
              </div>
              <div className="training-title">{c.title}</div>
              <div className="training-meta">
                <span>⏱ {c.duration}</span>
                <span>📶 {c.level}</span>
                <span>⭐ {c.rating}</span>
              </div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:'0.75rem' }}>
                by {c.provider}
              </div>
              {c.skill && (
                <div className="training-resource-links">
                  {buildLearningResources(c.skill).map(resource => (
                    <a
                      key={`${c.skill}-${resource.provider}`}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="training-resource-link"
                    >
                      {resource.provider}
                    </a>
                  ))}
                </div>
              )}
              <div className="training-footer">
                <span style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}>
                  👥 {c.enrolled.toLocaleString()} enrolled
                </span>
                <button className="btn-enroll" onClick={() => c.url ? window.open(c.url, '_blank', 'noopener,noreferrer') : enrollCourse(c)} disabled={enrolling === c.title}>
                  {enrolling === c.title ? 'Enrolling…' : 'Start Learning'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Completion Certificates & Milestones Banner */}
      <div className="card" style={{ marginTop: '2rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(99,102,241,0.1))', border: '1px solid rgba(16,185,129,0.25)' }}>
        <div className="card-header">
          <div className="card-title">🏆 Verified Training Certificates & Milestones</div>
          <button className="card-action" onClick={() => alert('Certificate PDF download initiated!')}>📥 Download All Certificates</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
            <div style={{ fontWeight: 700, color: '#10b981' }}>🎓 Cloud & DevOps Masterclass</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed on Aug 20, 2026 • 100% Score</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
              <span className="tag urgent">Verified</span>
              <button style={{ padding: '0.35rem 0.75rem', borderRadius: 6, background: '#10b981', border: 'none', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }} onClick={() => alert('Viewing Official Verified Certificate for Cloud & DevOps Masterclass')}>📜 View Certificate</button>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
            <div style={{ fontWeight: 700, color: '#a5b4fc' }}>⚡ React & Frontend Architecture</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>In Progress • 3 of 4 Milestones Done</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
              <span className="tag hot">75% Progress</span>
              <button style={{ padding: '0.35rem 0.75rem', borderRadius: 6, background: 'rgba(99,102,241,0.2)', border: '1px solid #6366f1', color: '#a5b4fc', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }} onClick={() => alert('Milestone 4: Server Components & Memory Optimization')}>▶ Continue Path</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trainings;
