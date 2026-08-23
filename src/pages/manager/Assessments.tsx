import React from "react";
import { ClipboardCheck, LockKeyhole } from "lucide-react";
import ManagerPage from "./ManagerPage";

export default function Assessments() {
  return (
    <ManagerPage
      title="Assessments"
      subtitle="View team assessment progress and evaluation results."
      icon={ClipboardCheck}
      active="Assessments"
    >
      <section className="manager-card manager-permission-card">
        <div className="permission-icon">
          <LockKeyhole size={22} />
        </div>

        <h2>Assessment data is not available yet</h2>

        <p>
          No assessment API is currently available in the backend for the
          Manager workspace. Assessment data has therefore not been
          hardcoded into this page.
        </p>

        <div className="permission-note">
          Once assessment APIs are added to the backend, this page can be
          connected to display employee assessment status, scores,
          completion progress and evaluation results.
        </div>
      </section>
    </ManagerPage>
  );
}