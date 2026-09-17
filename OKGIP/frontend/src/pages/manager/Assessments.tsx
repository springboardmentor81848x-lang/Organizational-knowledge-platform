import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ClipboardCheck, Loader2 } from "lucide-react";
import ManagerPage from "./ManagerPage";
import managerService from "@/services/managerService";

export default function Assessments() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    managerService.getManagerAssessmentAnalytics()
      .then(value => { if (active) setData(value || {}); })
      .catch(err => { if (active) setError(err?.response?.data?.message || err?.message || "Unable to load assessment analytics."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const rows = Array.isArray(data.rows) ? data.rows : [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r:any) => [r.employeeName, r.assessmentName, r.assessmentType, r.status].some(v => String(v ?? "").toLowerCase().includes(q)));
  }, [rows, query]);

  return <ManagerPage title="Assessments" subtitle="Monitor self, peer and manager assessment progress for your team." icon={ClipboardCheck} active="Assessments">
    <div className="manager-stat-grid">
      {[
        ["Attempts", data.attempts ?? 0], ["Submitted", data.submitted ?? 0],
        ["In Progress", data.inProgress ?? 0], ["Average Score", `${Number(data.averageScore ?? 0).toFixed(1)}%`]
      ].map(([label,value]) => <div className="manager-stat-card" key={String(label)}><span>{label}</span><strong>{value}</strong></div>)}
    </div>
    <section className="manager-card manager-data-card">
      <div className="manager-toolbar"><div><span className="manager-section-label">ASSESSMENT MONITORING</span><h2>Team Assessment Attempts</h2></div><input className="manager-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search employee or assessment..." /></div>
      {loading && <div className="manager-loading"><Loader2 className="spin" size={18}/>Loading assessment data...</div>}
      {!loading && error && <div className="manager-empty-state"><AlertTriangle size={24}/><strong>Unable to load assessments</strong><p>{error}</p></div>}
      {!loading && !error && filtered.length === 0 && <div className="manager-empty-state"><ClipboardCheck size={24}/><strong>No assessment attempts</strong><p>No assessment attempts are available for your team.</p></div>}
      {!loading && !error && filtered.length > 0 && <div className="manager-functional-table">
        <div className="manager-functional-head"><span>EMPLOYEE</span><span>ASSESSMENT</span><span>TYPE</span><span>STATUS</span><span>SCORE</span></div>
        {filtered.map((r:any)=><div className="manager-functional-row" key={r.attemptId}>
          <strong>{r.employeeName || "—"}</strong><span>{r.assessmentName || "—"}</span><span>{r.assessmentType || "—"}</span><span>{r.status || "—"}</span><strong>{r.percentage == null ? "—" : `${Number(r.percentage).toFixed(1)}%`}</strong>
        </div>)}
      </div>}
    </section>
  </ManagerPage>;
}
