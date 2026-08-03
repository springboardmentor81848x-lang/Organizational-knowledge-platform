import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="articles" element={<Articles />} />
          {/* Add more routes here as needed */}
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
