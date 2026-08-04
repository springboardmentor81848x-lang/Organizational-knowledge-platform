import React from 'react';
import { BookOpen, ExternalLink, PlayCircle } from 'lucide-react';

const Trainings = () => {
  const [courses] = React.useState([
    { id: 1, title: 'Advanced Spring Boot Microservices', provider: 'Internal', url: '#', duration: '12h', matches: 15 },
    { id: 2, title: 'AWS Solutions Architect Prep', provider: 'Coursera', url: '#', duration: '40h', matches: 38 },
    { id: 3, title: 'Kafka Real-time Streams', provider: 'Udemy', url: '#', duration: '8h', matches: 12 },
    { id: 4, title: 'SEO Fundamentals', provider: 'LinkedIn Learning', url: '#', duration: '4h', matches: 8 }
  ]);

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Learning Interventions</h1>
          <p className="page-subtitle">AI-driven training program recommendations.</p>
        </div>
        <button className="primary-btn" onClick={() => alert("Opening course creator dialog...")}>
          <BookOpen size={18} />
          <span>Add Course</span>
        </button>
      </div>

      <div className="section-card glass-panel">
        <h2 style={{marginBottom: '20px'}}>Training Catalog</h2>
        <div className="recommendation-list">
          {courses.map(course => (
            <div className="rec-card" key={course.id}>
              <div className="stat-icon-wrapper" style={{background: 'rgba(255,255,255,0.05)'}}>
                <PlayCircle size={32} />
              </div>
              <div className="rec-details">
                <h4>{course.title}</h4>
                <p>{course.provider} • {course.duration}</p>
              </div>
              <div style={{marginRight: '20px', textAlign: 'right'}}>
                <div style={{fontWeight: 'bold', color: 'var(--success)'}}>{course.matches} Employees</div>
                <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Highly Recommended</div>
              </div>
              <button className="primary-btn" style={{background: 'var(--glass-bg)', border: '1px solid var(--glass-border)'}}>
                Launch <ExternalLink size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trainings;
