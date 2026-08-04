import React from 'react';
import { Search, Book, CheckCircle, Target, Users } from 'lucide-react';

const Skills = () => {
  const [employees] = React.useState([
    { id: 1, name: 'Alice Smith', role: 'Senior Frontend', department: 'Engineering', skills: ['React', 'CSS', 'Node.js'], level: 'Expert', gap: 'Low' },
    { id: 2, name: 'Bob Jones', role: 'Backend Engineer', department: 'Engineering', skills: ['Java', 'Spring Boot', 'SQL'], level: 'Intermediate', gap: 'Medium' },
    { id: 3, name: 'Carol White', role: 'DevOps', department: 'Platform', skills: ['AWS', 'Docker', 'Kubernetes'], level: 'Advanced', gap: 'Low' },
    { id: 4, name: 'Dave Brown', role: 'Marketing Lead', department: 'Marketing', skills: ['SEO', 'Analytics', 'Strategy'], level: 'Beginner', gap: 'High' }
  ]);

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Skill Inventory</h1>
          <p className="page-subtitle">Track and evaluate organizational competency frameworks.</p>
        </div>
        <div className="search-bar" style={{ width: '250px' }}>
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search employees..." />
        </div>
      </div>

      <div className="section-card glass-panel flex-column">
        <div className="section-header">
          <h2>Organizational Knowledge Base</h2>
          <button className="primary-btn pulse-glow" onClick={() => alert("Sending assessment surveys to all departments...")}><CheckCircle size={18} /> Run Assessment</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Role & Department</th>
              <th>Top Skills</th>
              <th>Proficiency</th>
              <th>Gap Analysis</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td className="font-medium">
                  <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <div className="avatar" style={{width:'28px', height:'28px', fontSize:'0.7rem'}}>{emp.name.charAt(0)}</div>
                    {emp.name}
                  </div>
                </td>
                <td>
                  <div style={{display:'flex', flexDirection:'column'}}>
                    <span>{emp.role}</span>
                    <span className="text-muted" style={{fontSize:'0.75rem'}}>{emp.department}</span>
                  </div>
                </td>
                <td>
                  <div style={{display:'flex', gap:'5px', flexWrap:'wrap'}}>
                    {emp.skills.map(s => <span key={s} className="status-badge" style={{background:'rgba(255,255,255,0.1)'}}>{s}</span>)}
                  </div>
                </td>
                <td>{emp.level}</td>
                <td>
                  <span className={`status-badge ${emp.gap === 'Low' ? 'published' : emp.gap === 'High' ? 'draft' : ''}`} style={emp.gap==='High'? {backgroundColor:'var(--danger)', color:'white'} : {}}>
                    {emp.gap} Gap
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Skills;
