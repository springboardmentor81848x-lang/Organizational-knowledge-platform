import React from 'react';
import { Target, TrendingDown, BookOpen, Users, AlertCircle, ArrowRight, Award, Activity, Search, Edit3, Sparkles, ChevronRight } from 'lucide-react';

const Dashboard = () => {

  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState([]);
  const [gapHeatmap, setGapHeatmap] = React.useState([]);
  const [trainingRecommendations, setTrainingRecommendations] = React.useState([]);

  React.useEffect(() => {
    // Attempting to fetch real data, with immediate rich fallback
    fetch('http://localhost:8080/api/dashboard')
      .then(res => {
        if (!res.ok) throw new Error("Backend not available");
        return res.json();
      })
      .then(data => {
        setStats(data.stats || []);
        setGapHeatmap(data.gapHeatmap || []);
        setTrainingRecommendations(data.trainingRecommendations || []);
        setTimeout(() => setLoading(false), 500);
      })
      .catch(err => {
        console.warn("Backend not running, falling back to rich static UI data.", err);
        // Fallback static data for premium visual demonstration
        setStats([
          { title: 'Total Workforce', value: '3,450', trend: '+124 this month', trendType: 'positive', icon: <Users size={28} color="#6366f1" /> },
          { title: 'Critical Skills Tracked', value: '142', trend: '24 new additions', trendType: 'positive', icon: <Edit3 size={28} color="#ec4899" /> },
          { title: 'Avg Competency Gap', value: '18%', trend: '-4% improvement', trendType: 'positive', icon: <TrendingDown size={28} color="#10b981" /> },
          { title: 'Active Learners', value: '1,894', trend: '54% of workforce', trendType: 'neutral', icon: <BookOpen size={28} color="#8b5cf6" /> }
        ]);
        
        setTrainingRecommendations([
          { id: 1, title: 'Advanced Cloud Architectures', matchScore: 98, provider: 'Internal Engineering', duration: '12h interactive', tag: 'High Priority' },
          { id: 2, title: 'Generative AI for Marketing', matchScore: 92, provider: 'Coursera Enterprise', duration: '4h self-paced', tag: 'Trending' },
          { id: 3, title: 'Real-time Event Streaming via Kafka', matchScore: 85, provider: 'Udemy Business', duration: '8h workshop', tag: 'Technical' }
        ]);

        setTimeout(() => setLoading(false), 800);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Synthesizing organizational intelligence...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-text">
          <h1>Organizational <span className="gradient-text">Intelligence</span></h1>
          <p>Real-time skill gap analysis, personalized learning paths, and workforce readiness metrics.</p>
        </div>
        <button className="primary-btn pulse-glow">
          <Sparkles size={20} />
          <span>Generate AI Action Plan</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div className="stat-card" key={idx}>
            <div className="stat-header">
              <div className="stat-icon-wrapper">{stat.icon}</div>
              <span className={`stat-trend ${stat.trendType === 'neutral' ? '' : stat.trendType === 'negative' ? 'negative' : ''}`}>
                {stat.trend}
              </span>
            </div>
            <div className="stat-content">
              <p className="stat-value">{stat.value}</p>
              <h3>{stat.title}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Main Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-panel">
            <div className="section-header">
              <h2><AlertCircle size={24} color="#ef4444" style={{marginRight: '12px'}}/> Critical Gap Alerts</h2>
              <button className="text-btn">View full analysis <ChevronRight size={18}/></button>
            </div>
            <div className="alert-list">
              <div className="alert-item high">
                <div className="alert-icon"><Target size={20} /></div>
                <div className="alert-content">
                  <h4>Cloud Infrastructure Security (AWS/Azure)</h4>
                  <p>Engineering Dept • Impacts Q3 Deliverables</p>
                </div>
                <div className="alert-meta">
                  <div className="gap-percentage" style={{color: 'var(--danger)'}}>42%</div>
                  <div className="gap-label">Deficit</div>
                </div>
              </div>
              <div className="alert-item medium">
                <div className="alert-icon"><Activity size={20} /></div>
                <div className="alert-content">
                  <h4>Predictive Data Modeling (Python/R)</h4>
                  <p>Data Science Team • Emerging Requirement</p>
                </div>
                <div className="alert-meta">
                  <div className="gap-percentage" style={{color: 'var(--warning)'}}>28%</div>
                  <div className="gap-label">Deficit</div>
                </div>
              </div>
              <div className="alert-item low">
                <div className="alert-icon"><Search size={20} /></div>
                <div className="alert-content">
                  <h4>Advanced SEO Fundamentals</h4>
                  <p>Marketing Dept • Routine Optimization</p>
                </div>
                <div className="alert-meta">
                  <div className="gap-percentage" style={{color: 'var(--success)'}}>15%</div>
                  <div className="gap-label">Deficit</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-panel" style={{ flex: 1 }}>
            <div className="section-header">
              <h2><Activity size={24} color="#6366f1" style={{marginRight: '12px'}}/> Organizational Activity</h2>
            </div>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-meta">Just now • Engineering Dept</div>
                <div className="activity-content"><strong>Alice Smith</strong> achieved Level 5 competency in <span>React.js</span></div>
              </div>
              <div className="activity-item">
                <div className="activity-meta">2 hours ago • HR Dept</div>
                <div className="activity-content">New training path <span>"Security Compliance 2026"</span> assigned to 450 employees</div>
              </div>
              <div className="activity-item">
                <div className="activity-meta">Yesterday • Marketing</div>
                <div className="activity-content">Department-wide skill assessment completed with <span>94% participation</span></div>
              </div>
            </div>
          </div>

        </div>

        {/* Side Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-panel" style={{ background: 'linear-gradient(160deg, rgba(29, 20, 41, 0.7) 0%, rgba(15, 17, 26, 0.8) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div className="section-header">
              <h2><Award size={24} color="#ec4899" style={{marginRight: '12px'}}/> Top Recommendations</h2>
              <button className="text-btn" style={{color: 'var(--accent-tertiary)'}}>Browse Library</button>
            </div>
            <div className="recommendation-list">
              {trainingRecommendations.map(rec => (
                <div className="rec-card" key={rec.id}>
                  <div className="rec-score-ring" data-score={rec.matchScore} style={{'--score': rec.matchScore}}></div>
                  <div className="rec-details">
                    <h4>{rec.title}</h4>
                    <p>{rec.provider} <span className="rec-badge">{rec.tag}</span></p>
                  </div>
                  <button className="icon-btn"><ArrowRight size={20}/></button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
