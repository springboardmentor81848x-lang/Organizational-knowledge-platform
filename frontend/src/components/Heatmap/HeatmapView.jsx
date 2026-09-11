import React from 'react';
import { FaThLarge, FaExclamationCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import './HeatmapView.css';

const HeatmapView = ({ gaps = [], role = 'Software Developer' }) => {
  const safeGaps = Array.isArray(gaps) && gaps.length > 0 ? gaps : [
    { skill: "System Design", category: "Architecture", required: "Advanced", current: "Intermediate", level: "Moderate", class: "moderate" },
    { skill: "Microservices", category: "Architecture", required: "Advanced", current: "Beginner", level: "Critical", class: "critical" },
    { skill: "Docker", category: "DevOps", required: "Intermediate", current: "Beginner", level: "Moderate", class: "moderate" },
    { skill: "AWS", category: "DevOps", required: "Intermediate", current: "Beginner", level: "Moderate", class: "moderate" },
    { skill: "Kubernetes", category: "DevOps", required: "Advanced", current: "Beginner", level: "Critical", class: "critical" },
  ];

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <h3><FaThLarge color="#4f46e5" /> Skill Discrepancy Heatmap Matrix ({role})</h3>
        
        <div className="heatmap-legend">
          <div className="legend-item">
            <div className="legend-box critical"></div>
            <span>Critical Gap (High)</span>
          </div>
          <div className="legend-item">
            <div className="legend-box moderate"></div>
            <span>Moderate Gap (Med)</span>
          </div>
          <div className="legend-item">
            <div className="legend-box minor"></div>
            <span>Minor Gap (Low)</span>
          </div>
          <div className="legend-item">
            <div className="legend-box met"></div>
            <span>Benchmark Met</span>
          </div>
        </div>
      </div>

      <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "16px" }}>
        Visual mapping of user proficiency level vs benchmark role expectations. Colors represent gap priority.
      </p>

      <div className="heatmap-grid">
        {safeGaps.map((item, index) => {
          const tileClass = item.class || (
            item.level === 'Critical' ? 'critical' :
            item.level === 'Moderate' ? 'moderate' :
            item.level === 'Minor' ? 'minor' : 'met'
          );

          return (
            <div key={index} className={`heatmap-tile ${tileClass}`}>
              <div className="tile-top">
                <h4 className="tile-skill-name">{item.skill}</h4>
                <span className="tile-category">{item.category || 'Skill'}</span>
              </div>

              <div className="tile-levels">
                <div>
                  <small style={{ display: 'block', opacity: 0.8 }}>Current</small>
                  <strong>{item.current}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <small style={{ display: 'block', opacity: 0.8 }}>Required</small>
                  <strong>{item.required}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="tile-status-badge">
                  {item.level === 'Critical' && <FaExclamationCircle color="#ef4444" style={{ marginRight: 4 }} />}
                  {item.level === 'Moderate' && <FaExclamationTriangle color="#f59e0b" style={{ marginRight: 4 }} />}
                  {item.level === 'Met' && <FaCheckCircle color="#10b981" style={{ marginRight: 4 }} />}
                  {item.level} Severity
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HeatmapView;
