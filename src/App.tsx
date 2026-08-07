import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "@/pages/auth/Login";
import { Register } from "@/pages/auth/Register"; // Import Register
import { Dashboard } from "@/pages/shared/Dashboard";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} /> {/* Register Route Added */}
      
      {/* Role Dashboards */}
      <Route path="/employee" element={<Dashboard />} />
      <Route path="/hr" element={<Dashboard />} />
      <Route path="/manager" element={<Dashboard />} />
      <Route path="/admin" element={<Dashboard />} />
    </Routes>
  );
}

export default App;