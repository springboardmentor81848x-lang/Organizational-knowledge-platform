import React from "react";
import EmployeePage, { Card, ProgressBar } from "@/components/layout/EmployeePage";
const rows = [["Spring Security", 68], ["Docker Fundamentals", 42], ["System Design", 25]];

const Progress: React.FC = () => (
  <EmployeePage title="My Progress" subtitle="Track learning activity, completion and skill improvement.">

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Learning Progress"><div className="space-y-5">{rows.map(x => <div key={x[0]}><div className="mb-1 flex justify-between text-xs"><b>{x[0]}</b><span>{x[1]}%</span></div><ProgressBar value={x[1]}/></div>)}</div></Card>
        <Card title="Learning Summary"><div className="grid grid-cols-2 gap-3">{[["Learning Progress","82%"],["Courses Done","8"],["Hours This Month","36.5"],["Current Streak","7 days"]].map(x => <div key={x[0]} className="rounded-lg bg-slate-50 p-4"><p className="text-[10px] text-slate-400">{x[0]}</p><b className="mt-2 block text-xl">{x[1]}</b></div>)}</div></Card>
      </div>

  </EmployeePage>
);
export default Progress;
