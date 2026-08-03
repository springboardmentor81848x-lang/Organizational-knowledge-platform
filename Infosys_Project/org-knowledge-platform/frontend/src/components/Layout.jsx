import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Book, LayoutDashboard, Settings, Search, LogOut } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Articles', path: '/articles', icon: <Book size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Book className="brand-icon" size={28} />
          <h2>Knowledge Base</h2>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-header">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search knowledge..." />
          </div>
          <div className="user-profile">
            <div className="avatar">AD</div>
            <span className="user-name">Admin User</span>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
