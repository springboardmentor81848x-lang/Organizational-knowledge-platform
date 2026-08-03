import React from 'react';
import { Users, FileText, Activity, TrendingUp, Plus } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = React.useState([
    { title: 'Total Articles', value: '1,248', icon: <FileText size={24} />, trend: '+12% this month' },
    { title: 'Active Users', value: '342', icon: <Users size={24} />, trend: '+5% this month' },
    { title: 'Contributions', value: '89', icon: <Activity size={24} />, trend: 'Past 7 days' },
    { title: 'Views', value: '45.2k', icon: <TrendingUp size={24} />, trend: '+18% this month' },
  ]);

  const [recentArticles, setRecentArticles] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('http://localhost:8080/api/dashboard')
      .then(res => res.json())
      .then(data => {
        // Map the backend data to our state
        const updatedStats = [...stats];
        // Merge data logic here if needed, but for MVP let's replace
        if(data.stats) setStats(data.stats.map(s => {
          let icon = <FileText size={24} />;
          if(s.title === "Active Users") icon = <Users size={24} />;
          if(s.title === "Contributions") icon = <Activity size={24} />;
          if(s.title === "Views") icon = <TrendingUp size={24} />;
          return {...s, icon};
        }));
        
        if(data.recentArticles) setRecentArticles(data.recentArticles);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching dashboard data: ", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="dashboard-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Welcome back! Here is what's happening today.</p>
        </div>
        <button className="primary-btn">
          <Plus size={18} />
          <span>New Article</span>
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div className="stat-card" key={idx}>
            <div className="stat-icon-wrapper">{stat.icon}</div>
            <div className="stat-content">
              <h3>{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
              <span className="stat-trend">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-sections">
        <div className="section-card">
          <div className="section-header">
            <h2>Recent Articles</h2>
            <button className="text-btn">View All</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentArticles.map(article => (
                <tr key={article.id}>
                  <td className="font-medium">{article.title}</td>
                  <td>{article.author}</td>
                  <td className="text-muted">{article.date}</td>
                  <td>
                    <span className={`status-badge ${article.status.toLowerCase()}`}>
                      {article.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
