import React from "react";
import { ArrowRight, LucideIcon } from "lucide-react";
import ManagerLayout, { ManagerNavKey } from "./ManagerLayout";

interface ManagerPageProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  active: ManagerNavKey;
  children?: React.ReactNode;
}

const ManagerPage: React.FC<ManagerPageProps> = ({
  title,
  subtitle,
  icon: Icon,
  active,
  children,
}) => {
  return (
    <ManagerLayout active={active} breadcrumb={title}>
      <section className="manager-content manager-inner-page">
        <div className="manager-page-header">
          <div>
            <div className="manager-labels">
              <span>MANAGER WORKSPACE</span>
              <span>● Team Intelligence</span>
            </div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>

        {children || (
          <section className="manager-card manager-empty-state">
            <div className="manager-empty-icon">
              <Icon size={21} />
            </div>
            <h2>{title}</h2>
            <p>
              This manager workspace is separated from the dashboard and is ready
              for its page-specific UI and backend data.
            </p>
            <button type="button">
              Open Workspace <ArrowRight size={14} />
            </button>
          </section>
        )}
      </section>
    </ManagerLayout>
  );
};

export default ManagerPage;
