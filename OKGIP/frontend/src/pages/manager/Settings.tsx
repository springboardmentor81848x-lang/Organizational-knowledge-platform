import React from "react";
import { LogOut, Settings as SettingsIcon, UserCircle } from "lucide-react";
import ManagerPage from "./ManagerPage";
import { useAuth } from "@/context/AuthContext";

export default function Settings() {
  const { email, role, logout } = useAuth();
  return <ManagerPage title="Settings" subtitle="View the authenticated manager account and session controls." icon={SettingsIcon} active="Settings">
    <section className="manager-card manager-data-card">
      <div className="manager-toolbar"><div><span className="manager-section-label">ACCOUNT</span><h2>Manager Account</h2><p>These values are taken from the authenticated JWT/session.</p></div><UserCircle size={28}/></div>
      <div className="manager-account-grid">
        <div><span>Email</span><strong>{email || "—"}</strong></div>
        <div><span>Role</span><strong>{role || "—"}</strong></div>
      </div>
      <button className="manager-danger-btn" onClick={logout}><LogOut size={15}/>Log out</button>
    </section>
  </ManagerPage>;
}
