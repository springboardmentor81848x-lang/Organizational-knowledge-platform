import React from "react";
import { GraduationCap } from "lucide-react";
import ManagerPage from "./ManagerPage";

const TrainingManagement: React.FC = () => (
  <ManagerPage
    title="Training Management"
    subtitle="Assign learning paths and track training completion for your team."
    icon={GraduationCap}
    active="Training Management"
  />
);

export default TrainingManagement;
