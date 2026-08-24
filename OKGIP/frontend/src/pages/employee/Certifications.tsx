import React from "react";
import EmployeePage, { Card, ProgressBar } from "@/components/layout/EmployeePage";
const rows = [["AWS Cloud Practitioner", "AWS", "2026-03-12", "2029-03-12", "Verified"], ["Java Foundations", "Oracle", "2025-11-04", "2028-11-04", "Verified"], ["Agile Fundamentals", "Infosys Springboard", "2026-01-15", "No expiry", "Verified"]];

const Certifications: React.FC = () => (
  <EmployeePage title="Certifications" subtitle="Manage verified certifications and renewal dates.">

      <Card title="My Certifications" action={<button className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white">Add Credential</button>}>
        <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-xs"><thead><tr className="border-b text-[10px] uppercase text-slate-400">{["Certification","Provider","Issue Date","Expiry","Status"].map(x=><th key={x} className="px-3 py-3">{x}</th>)}</tr></thead><tbody>{rows.map(x=><tr key={x[0]} className="border-b border-slate-50">{x.map((v,i)=><td key={i} className={`px-3 py-3 ${i===0?"font-semibold":""}`}>{v}</td>)}</tr>)}</tbody></table></div>
      </Card>

  </EmployeePage>
);
export default Certifications;
