import React from "react";
import { BarChart3 } from "lucide-react";
import ManagerPage from "./ManagerPage";

const Reports: React.FC = () => (
  <ManagerPage
    title="Reports & Analytics"
    subtitle="Generate team reports and review workforce analytics."
    icon={BarChart3}
    active="Reports & Analytics"
  />
);

export default Reports;
