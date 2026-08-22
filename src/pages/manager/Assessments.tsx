import React from "react";
import { ClipboardCheck } from "lucide-react";
import ManagerPage from "./ManagerPage";

export default function Assessments() {
  return (
    <ManagerPage
      title="Assessments"
      subtitle="Manage team assessments and pending evaluation requests."
      icon={ClipboardCheck}
      active="Assessments"
    />
  );
}
