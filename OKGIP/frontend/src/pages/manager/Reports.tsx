import React, { useEffect, useState } from "react";
import { AlertTriangle, BarChart3, Download, Loader2, Printer } from "lucide-react";
import ManagerPage from "./ManagerPage";
import managerService from "@/services/managerService";

export default function Reports() {
  const [report,setReport]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  useEffect(()=>{ managerService.getManagerReport().then(setReport).catch(e=>setError(e?.response?.data?.message||e?.message||"Unable to load report data.")).finally(()=>setLoading(false)); },[]);

  const download = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a");
    a.href=url; a.download="manager-report.json"; a.click(); URL.revokeObjectURL(url);
  };

  const team=Array.isArray(report?.team)?report.team:[];
  const departments=Array.isArray(report?.departments)?report.departments:[];
  const heatmap=Array.isArray(report?.heatmap)?report.heatmap:[];
  const training=report?.training||{};
  const assessments=report?.assessments||{};

  return <ManagerPage title="Reports & Analytics" subtitle="Review team capability, skill gaps, learning adoption and assessment results using live backend data." icon={BarChart3} active="Reports & Analytics">
    <section className="manager-card manager-data-card">
      <div className="manager-toolbar"><div><span className="manager-section-label">TEAM REPORT</span><h2>Manager Analytics Report</h2><p>Generated from the current manager-scoped API response.</p></div><div className="manager-toolbar-right"><button className="manager-small-btn" disabled={!report} onClick={download}><Download size={14}/>Export JSON</button><button className="manager-small-btn" disabled={!report} onClick={()=>window.print()}><Printer size={14}/>Print</button></div></div>
      {loading&&<div className="manager-loading"><Loader2 className="spin" size={18}/>Loading report...</div>}
      {!loading&&error&&<div className="manager-empty-state"><AlertTriangle size={24}/><strong>Unable to load report</strong><p>{error}</p></div>}
      {!loading&&!error&&report&&<div className="report-grid">
        <div className="report-block"><h3>Team</h3><p>{team.length} employees with current gap records.</p></div>
        <div className="report-block"><h3>Departments</h3><p>{departments.length} departments represented in the assigned team.</p></div>
        <div className="report-block"><h3>Skill Gaps</h3><p>{heatmap.length} skills represented in the gap heatmap.</p></div>
        <div className="report-block"><h3>Training</h3><p>{training.enrollments??0} enrollments · {Number(training.completionRate??0).toFixed(1)}% completed.</p></div>
        <div className="report-block"><h3>Assessments</h3><p>{assessments.attempts??0} attempts · {assessments.submitted??0} submitted.</p></div>
      </div>}
    </section>
  </ManagerPage>;
}
