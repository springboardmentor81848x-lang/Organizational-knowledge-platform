import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Admin from './components/Admin';

function App() {
  return (
    <Router>
      <div style={{ padding: '10px', background: '#f0f0f0' }}>
        <nav>
          <Link to="/" style={{ marginRight: '10px' }}>Login</Link>
          <Link to="/dashboard" style={{ marginRight: '10px' }}>Dashboard</Link>
          <Link to="/admin">Admin Panel</Link>
        </nav>
      </div>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;