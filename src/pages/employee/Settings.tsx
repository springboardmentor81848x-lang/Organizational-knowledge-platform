import React from "react";
import EmployeePage, { Card, ProgressBar } from "@/components/layout/EmployeePage";
const rows = [["Email Notifications", "Enabled"], ["Learning Reminders", "Enabled"], ["Profile Visibility", "Organization"], ["Theme", "System"]];

const Settings: React.FC = () => (
  <EmployeePage title="Settings" subtitle="Manage your workspace preferences.">

      <Card title="Workspace Preferences"><div className="space-y-3">{rows.map(x=><div key={x[0]} className="flex items-center justify-between rounded-xl border p-4"><span className="text-xs font-semibold">{x[0]}</span><span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] text-slate-600">{x[1]}</span></div>)}</div></Card>

  </EmployeePage>
);
export default Settings;
