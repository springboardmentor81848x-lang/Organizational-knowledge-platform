import React from "react";
import EmployeePage, { Card, ProgressBar } from "@/components/layout/EmployeePage";
const rows = [["Backend Skill Review", "Assigned by Team Lead", "Oct 24", "Pending", "\u2014"], ["Communication Review", "Assigned by Team Lead", "Oct 28", "Completed", "100%"], ["Project Collaboration", "Assigned by Manager", "Nov 02", "Pending", "\u2014"]];

const PeerAssessment: React.FC = () => (
  <EmployeePage title="Peer Assessment" subtitle="Review peer assessment requests and feedback.">

      <Card title="Assessment Queue" subtitle="Employee assessment workspace">
        <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-xs"><thead><tr className="border-b text-[10px] uppercase text-slate-400">{["Assessment","Skill / Target","Due","Status","Progress"].map(x=><th key={x} className="px-3 py-3">{x}</th>)}</tr></thead><tbody>{rows.map(x=><tr key={x[0]} className="border-b border-slate-50">{x.map((v,i)=><td key={i} className={`px-3 py-3 ${i===0?"font-semibold":""}`}>{v}</td>)}</tr>)}</tbody></table></div>
      </Card>

  </EmployeePage>
);
export default PeerAssessment;
