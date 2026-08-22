import React from "react";
import { Activity } from "lucide-react";
import ManagerPage from "./ManagerPage";

const KnowledgeGaps: React.FC = () => (
  <ManagerPage
    title="Knowledge Gaps"
    subtitle="Review identified capability shortages across your team."
    icon={Activity}
    active="Knowledge Gap Analysis"
  />
);

export default KnowledgeGaps;
