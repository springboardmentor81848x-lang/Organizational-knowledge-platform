import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Skills from './pages/Skills';
import Analytics from './pages/Analytics';
import Trainings from './pages/Trainings';
import Mentorship from './pages/Mentorship';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="skills" element={<Skills />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="trainings" element={<Trainings />} />
          <Route path="mentorship" element={<Mentorship />} />
          {/* Fallback for undefined routes */}
          <Route path="*" element={
            <div className="dashboard-container">
              <h2>404 - Page Not Found</h2>
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
