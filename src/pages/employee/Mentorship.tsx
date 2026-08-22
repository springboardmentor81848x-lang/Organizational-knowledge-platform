import React from "react";
import EmployeePage, { Card, ProgressBar } from "@/components/layout/EmployeePage";
const rows = [["Sarah Chen", "Cloud Architecture"], ["David Kim", "Backend Engineering"], ["Marcus Thorne", "Security"]];

const Mentorship: React.FC = () => (
  <EmployeePage title="Mentorship" subtitle="Connect with mentors and knowledge-sharing opportunities.">

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Recommended Mentors"><div className="space-y-3">{rows.map(x=><div key={x[0]} className="flex items-center justify-between rounded-xl border p-4"><div><b className="text-xs">{x[0]}</b><p className="mt-1 text-[10px] text-slate-500">{x[1]}</p></div><button className="rounded-lg border px-3 py-2 text-[10px] font-semibold">Request</button></div>)}</div></Card>
        <Card title="My Mentorship"><div className="rounded-xl bg-purple-50 p-5"><b className="text-xs">Backend Career Guidance</b><p className="mt-1 text-xs text-slate-500">Your next mentoring session will appear here.</p></div></Card>
      </div>

  </EmployeePage>
);
export default Mentorship;
