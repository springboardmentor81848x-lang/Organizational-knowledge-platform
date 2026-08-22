import React from "react";
import { Bell, ChevronRight, Moon, Search } from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import { useAuth } from "@/context/AuthContext";
import profileService from "@/services/profileService";
import { useEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  activeLabel?: string;
}

const EmployeeLayout: React.FC<Props> = ({ children, title, subtitle }) => {
  const { email } = useAuth();
  const [profileName, setProfileName] = useState<string | null>(null);
  const [jobRole, setJobRole] = useState("EMPLOYEE");

  useEffect(() => {
    profileService.getMyProfile().then((p) => {
      setProfileName(p.employeeName || null);
      setJobRole((p as any).jobRoleName || "EMPLOYEE");
    }).catch(() => undefined);
  }, []);

  const displayName = profileName || email?.split("@")[0]
    ?.replace(/[._-]/g, " ")
    ?.replace(/\b\w/g, (c) => c.toUpperCase()) || "Employee";

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="employee-dashboard">
      <EmployeeSidebar />

      <main className="employee-main">
        <header className="employee-topbar">
          <div className="employee-breadcrumb">
            <NavButton />
            <span>/</span>
            <strong>{title}</strong>
          </div>

          <div className="employee-top-actions">
            <div className="employee-search">
              <Search size={15} />
              <input placeholder="Search skills, training, people..." />
            </div>

            <button className="employee-top-icon" type="button">
              <Bell size={17} />
            </button>

            <button className="employee-top-icon" type="button">
              <Moon size={16} />
            </button>

            <div className="employee-user">
              <div className="employee-avatar">{initials || "E"}</div>
              <div className="employee-user-text">
                <strong>{displayName}</strong>
                <small>{jobRole}</small>
              </div>
              <ChevronRight size={14} />
            </div>
          </div>
        </header>

        <section className="employee-content">
          <div className="mb-5">
            <span className="employee-greeting">{title.toUpperCase()}</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
        </section>
      </main>
    </div>
  );
};

const NavButton = () => {
  // Kept as a simple link-like control so every employee page has
  // the same breadcrumb alignment as the dashboard.
  return <span>Dashboard</span>;
};

export default EmployeeLayout;
