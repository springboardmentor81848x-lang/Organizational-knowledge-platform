import React from "react";
import { GraduationCap, LockKeyhole } from "lucide-react";
import ManagerPage from "./ManagerPage";

export default function TrainingManagement() {
  return (
    <ManagerPage
      title="Training Management"
      subtitle="Review training resources and learning interventions available to the organization."
      icon={GraduationCap}
      active="Training Management"
    >
      <section className="manager-card manager-permission-card">
        <div className="permission-icon">
          <LockKeyhole size={22} />
        </div>

        <h2>Training management is restricted</h2>

        <p>
          The current backend exposes training management through
          <code> /api/admin/trainings </code>
          and training-skill mappings through
          <code> /api/admin/training-skills </code>.
          These endpoints currently require the ADMIN role.
        </p>

        <div className="permission-note">
          Training creation, editing, deletion and skill mapping should be
          managed from the Admin workspace. Manager learning recommendations
          can use the AI recommendation and employee gap-analysis features.
        </div>
      </section>
    </ManagerPage>
  );
}