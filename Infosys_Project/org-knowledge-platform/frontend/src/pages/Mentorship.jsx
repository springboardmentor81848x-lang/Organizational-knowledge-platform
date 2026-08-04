import React from 'react';
import { Users, UserPlus, MessageCircle, Star } from 'lucide-react';

const Mentorship = () => {
  const [mentors] = React.useState([
    { id: 1, name: 'Alice Smith', expertise: 'React / Frontend', rating: 4.9, available: true },
    { id: 2, name: 'Carol White', expertise: 'AWS / DevOps', rating: 4.7, available: false },
    { id: 3, name: 'Bob Jones', expertise: 'Spring Boot / Backend', rating: 5.0, available: true }
  ]);

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mentorship Network</h1>
          <p className="page-subtitle">Peer knowledge-sharing and expert directory.</p>
        </div>
        <button className="primary-btn pulse-glow" onClick={() => alert("Mentor application submitted!")}>
          <UserPlus size={18} />
          <span>Become a Mentor</span>
        </button>
      </div>

      <div className="grid-2-col">
        {mentors.map(mentor => (
          <div key={mentor.id} className="stat-card glass-panel" style={{alignItems: 'center', display: 'flex'}}>
             <div className="avatar" style={{width: '64px', height: '64px', fontSize: '1.5rem', marginRight: '1rem'}}>
               {mentor.name.charAt(0)}
             </div>
             <div className="stat-content" style={{flex: 1}}>
               <h3 style={{fontSize: '1.1rem', color: 'var(--text-primary)'}}>{mentor.name}</h3>
               <p style={{color: 'var(--accent-primary)', fontSize: '0.9rem', marginBottom: '0.5rem'}}>{mentor.expertise}</p>
               <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                 <Star size={16} color="var(--warning)" fill="var(--warning)" />
                 <span style={{fontSize: '0.9rem'}}>{mentor.rating}</span>
               </div>
             </div>
             <div>
               {mentor.available ? (
                 <button className="primary-btn" style={{padding: '0.5rem 1rem'}}>
                   <MessageCircle size={16} /> Request
                 </button>
               ) : (
                 <button className="primary-btn" disabled style={{background: 'rgba(255,255,255,0.1)', cursor: 'not-allowed', color: 'var(--text-muted)'}}>
                   Busy
                 </button>
               )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mentorship;
