import React from 'react';
import { BarChart3, TrendingUp, Search, PieChart } from 'lucide-react';

const Analytics = () => {
  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gap Analytics</h1>
          <p className="page-subtitle">Historical trends and deep competency analytics.</p>
        </div>
        <button className="primary-btn pulse-glow" onClick={() => alert("Generating full PDF analytics report...")}>
          <BarChart3 size={18} />
          <span>Generate Report</span>
        </button>
      </div>

      <div className="grid-2-col">
        <div className="section-card glass-panel" style={{minHeight:'300px', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
          <TrendingUp size={48} color="var(--accent-primary)" style={{opacity:0.5, marginBottom:'20px'}}/>
          <h3>Skill Progression Over Time</h3>
          <p className="text-muted" style={{marginTop:'10px', textAlign:'center'}}>
            Integration with Chart.js is required to visualize historical performance.<br/><br/>
            Current Data: +14% Proficiency growth in Q3.
          </p>
        </div>
        
        <div className="section-card glass-panel" style={{minHeight:'300px', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
          <PieChart size={48} color="var(--success)" style={{opacity:0.5, marginBottom:'20px'}}/>
          <h3>Department Competency Distribution</h3>
          <p className="text-muted" style={{marginTop:'10px', textAlign:'center'}}>
            Visualizes target compliance versus current capabilities.<br/><br/>
            Engineering: 85% • Marketing: 65% • Sales: 90%
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
