import React from "react";
import { Users } from "lucide-react";
import ManagerPage from "./ManagerPage";

const Team: React.FC = () => (
  <ManagerPage
    title="Team"
    subtitle="Manage your direct reports and team-level workforce information."
    icon={Users}
    active="Employees"
  />
);

export default Team;
