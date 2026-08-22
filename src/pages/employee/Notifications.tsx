import React from "react";
import EmployeePage, { Card, ProgressBar } from "@/components/layout/EmployeePage";
const rows = [["Skill Gap Analysis Updated", "Review the latest skill analysis."], ["Training Assigned", "A new learning program is available."], ["Assessment Due", "Complete your pending assessment."], ["Certificate Verified", "Your certification has been verified."]];

const Notifications: React.FC = () => (
  <EmployeePage title="Notifications" subtitle="Review important platform and learning updates.">

      <Card title="Notifications"><div className="space-y-3">{rows.map(x=><div key={x[0]} className="rounded-xl border p-4"><b className="text-xs">{x[0]}</b><p className="mt-1 text-xs text-slate-500">{x[1]}</p></div>)}</div></Card>

  </EmployeePage>
);
export default Notifications;
