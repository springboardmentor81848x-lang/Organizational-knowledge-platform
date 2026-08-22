import React from "react";
import EmployeePage, { Card, ProgressBar } from "@/components/layout/EmployeePage";
const rows = [["Quick Learner", "Completed 5 courses"], ["Skill Master", "Advanced Java"], ["Consistent Learner", "7 day streak"], ["Knowledge Seeker", "10 learning activities"]];

const Achievements: React.FC = () => (
  <EmployeePage title="Achievements" subtitle="View badges, milestones and learning accomplishments.">

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{rows.map(x => <div key={x[0]} className="rounded-xl border bg-white p-5 text-center shadow-sm"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">★</div><h3 className="mt-4 text-sm font-bold">{x[0]}</h3><p className="mt-1 text-xs text-slate-500">{x[1]}</p></div>)}</div>

  </EmployeePage>
);
export default Achievements;
