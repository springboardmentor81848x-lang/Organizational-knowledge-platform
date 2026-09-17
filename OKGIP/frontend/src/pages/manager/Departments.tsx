import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Building2, Loader2 } from "lucide-react";
import ManagerPage from "./ManagerPage";
import managerService from "@/services/managerService";

export default function Departments() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    managerService.getManagerDepartments()
      .then(data => { if (active) setRows(Array.isArray(data) ? data : []); })
      .catch(err => { if (active) setError(err?.response?.data?.message || err?.message || "Unable to load department data."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const total = useMemo(() => rows.reduce((n, r) => n + Number(r.employeeCount || 0), 0), [rows]);

  return <ManagerPage title="Departments" subtitle="Department-level skill coverage, readiness and knowledge gaps for your assigned team." icon={Building2} active="Departments">
    <section className="manager-card manager-data-card">
      <div className="manager-toolbar"><div><span className="manager-section-label">DEPARTMENT INTELLIGENCE</span><h2>Team Department Coverage</h2><p>Values are calculated from employees assigned to this manager.</p></div><span className="manager-count">{total} team employee{total === 1 ? "" : "s"}</span></div>
      {loading && <div className="manager-loading"><Loader2 className="spin" size={18}/>Loading department analytics...</div>}
      {!loading && error && <div className="manager-empty-state"><AlertTriangle size={24}/><strong>Unable to load departments</strong><p>{error}</p></div>}
      {!loading && !error && rows.length === 0 && <div className="manager-empty-state"><Building2 size={24}/><strong>No department data</strong><p>No department information is available for your assigned team.</p></div>}
      {!loading && !error && rows.length > 0 && <div className="manager-functional-table">
        <div className="manager-functional-head"><span>DEPARTMENT</span><span>EMPLOYEES</span><span>READINESS</span><span>AVERAGE GAP</span></div>
        {rows.map((r:any) => <div className="manager-functional-row" key={r.departmentName}>
          <strong>{r.departmentName || "—"}</strong><span>{r.employeeCount ?? 0}</span><strong>{Number(r.averageReadinessPercentage ?? 0).toFixed(1)}%</strong><strong className={Number(r.averageGapPercentage ?? 0) >= 50 ? "danger" : ""}>{Number(r.averageGapPercentage ?? 0).toFixed(1)}%</strong>
        </div>)}
      </div>}
    </section>
  </ManagerPage>;
}
