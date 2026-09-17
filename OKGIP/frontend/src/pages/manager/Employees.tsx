import React, { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Loader2, Search, ShieldCheck, Users, X, UserPlus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import ManagerPage from "./ManagerPage";
import managerService from "@/services/managerService";
import { TeamAnalytics } from "@/services/analyticsService";

const pct = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? `${Math.round(n)}%` : "—";
};

const roleId = (r: any) => Number(r?.jobRoleId ?? r?.id);
const roleName = (r: any) => String(r?.jobRoleName ?? r?.name ?? "").trim();

export default function Employees() {
  const [params, setParams] = useSearchParams();
  const [team, setTeam] = useState<TeamAnalytics[]>([]);
  const [available, setAvailable] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [employeeId, setEmployeeId] = useState<number | "">("");
  const [jobRoleId, setJobRoleId] = useState<number | "">("");
  const [type, setType] = useState<"PRIMARY" | "SECONDARY">("PRIMARY");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [t, a, r] = await Promise.all([
        managerService.getMyTeam(),
        managerService.getAvailableEmployees(),
        managerService.getJobRoles(),
      ]);
      setTeam(Array.isArray(t) ? t : []);
      setAvailable(Array.isArray(a) ? a : []);
      setRoles(Array.isArray(r) ? r : []);
    } catch (e: any) {
      setTeam([]);
      setError(e?.response?.data?.message || e?.response?.data?.error || e?.message || "Unable to load team data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const id = Number(params.get("employee"));
    if (!id) { setSelected(null); return; }
    managerService.getEmployeeSummary(id).then(setSelected).catch(() => setSelected(null));
  }, [params]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? team.filter((e: any) => [e.employeeName, e.employeeCode, e.jobRoleName].some(v => String(v ?? "").toLowerCase().includes(q)))
      : team;
  }, [team, query]);

  const selectedAvailable = useMemo(
    () => available.find(e => Number(e.employeeId) === Number(employeeId)),
    [available, employeeId]
  );

  const assignedRoleIds = useMemo(() => {
    const ids = selectedAvailable?.assignedJobRoleIds;
    return new Set(Array.isArray(ids) ? ids.map(Number) : []);
  }, [selectedAvailable]);

  const selectableRoles = useMemo(
    () => roles.filter(r => Number.isFinite(roleId(r)) && !assignedRoleIds.has(roleId(r))),
    [roles, assignedRoleIds]
  );

  useEffect(() => {
    if (jobRoleId && !selectableRoles.some(r => roleId(r) === Number(jobRoleId))) {
      setJobRoleId("");
    }
  }, [employeeId, selectableRoles, jobRoleId]);

  const openAssign = () => {
    setSaveError("");
    setEmployeeId("");
    setJobRoleId("");
    setType("PRIMARY");
    setShow(true);
  };

  const assign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) { setSaveError("Select an approved employee."); return; }
    if (!jobRoleId) { setSaveError("Select a job role that is not already assigned to this employee."); return; }
    try {
      setSaving(true);
      setSaveError("");
      await managerService.assignEmployeeToMyTeam(Number(employeeId), Number(jobRoleId), type);
      setShow(false);
      await load();
    } catch (e: any) {
      setSaveError(e?.response?.data?.message || e?.response?.data?.error || e?.message || "Unable to assign employee.");
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ManagerPage title="Employees" subtitle="View your assigned team and assign approved employees using the existing job-role assignment workflow." icon={Users} active="Employees">
      <section className="manager-card manager-data-card">
        <div className="manager-toolbar">
          <div className="manager-search-large"><Search size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, code or role…" /></div>
          <button className="dashboard-primary-btn" onClick={openAssign}><UserPlus size={15}/> Assign Team Member</button>
          <span>{team.length} team member{team.length === 1 ? "" : "s"}</span>
        </div>
        {loading && <div className="manager-loading"><Loader2 className="spin" size={18}/> Loading team…</div>}
        {!loading && error && <div className="manager-empty-state"><AlertTriangle size={24}/><strong>Unable to load team</strong><p>{error}</p></div>}
        {!loading && !error && !team.length && <div className="manager-empty-state"><Users size={24}/><strong>No team members assigned</strong><p>Assign an approved employee to a job role to add them to your team.</p></div>}
        {!loading && !error && !!team.length && <div className="manager-modern-table"><div className="modern-head"><span>Employee</span><span>Role</span><span>Readiness</span><span>Gap</span><span/></div>{filtered.map((e: any) => <button className="modern-row" type="button" key={e.employeeId} onClick={() => setParams({ employee: String(e.employeeId) })}><span><b>{e.employeeName}</b><small>{e.employeeCode}</small></span><span>{e.jobRoleName || "—"}</span><strong>{pct(e.readinessPercentage)}</strong><strong className={Number(e.gapPercentage) >= 50 ? "danger" : ""}>{pct(e.gapPercentage)}</strong><span>View →</span></button>)}</div>}
      </section>

      {selected && <section className="manager-card manager-detail-card"><div className="detail-header"><div><span>EMPLOYEE ANALYTICS</span><h2>{selected.employeeName || selected.name || "Employee"}</h2><p>Live employee analytics from the backend.</p></div><button onClick={() => { setSelected(null); setParams({}); }}><X size={16}/></button></div><div className="detail-kpis"><div><ShieldCheck/><b>{pct(selected.readinessPercentage)}</b><span>Readiness</span></div><div><Activity/><b>{pct(selected.gapPercentage ?? selected.overallGapPercentage)}</b><span>Knowledge Gap</span></div><div><Users/><b>{selected.totalSkills ?? "—"}</b><span>Skills</span></div></div><pre className="api-json">{JSON.stringify(selected, null, 2)}</pre></section>}

      {show && <div className="manager-modal-backdrop"><form className="manager-modal" onSubmit={assign}>
        <div className="detail-header"><div><span>TEAM MANAGEMENT</span><h2>Assign Team Member</h2><p>This records the logged-in manager as the assignment owner.</p></div><button type="button" onClick={() => setShow(false)}><X size={16}/></button></div>

        <label>Approved Employee
          <select value={employeeId} onChange={e => { setEmployeeId(e.target.value ? Number(e.target.value) : ""); setSaveError(""); }}>
            <option value="">Select employee</option>
            {available.filter(e => !e.alreadyInMyTeam).map(e => <option key={e.employeeId} value={e.employeeId}>{e.employeeName} ({e.employeeCode})</option>)}
          </select>
        </label>

        {selectedAvailable && <div style={{ margin: "-4px 0 10px", padding: "10px 12px", borderRadius: 10, background: "#f7f5ff", border: "1px solid #e9e2ff", fontSize: 13 }}>
          <strong>Existing job roles:</strong>{" "}
          {Array.isArray(selectedAvailable.assignedJobRoleNames) && selectedAvailable.assignedJobRoleNames.length
            ? selectedAvailable.assignedJobRoleNames.join(", ")
            : "None"}
        </div>}

        <label>Job Role
          <select value={jobRoleId} onChange={e => { setJobRoleId(e.target.value ? Number(e.target.value) : ""); setSaveError(""); }} disabled={!employeeId || selectableRoles.length === 0}>
            <option value="">{!employeeId ? "Select employee first" : selectableRoles.length ? "Select available job role" : "No unassigned job role available"}</option>
            {selectableRoles.map(r => <option key={roleId(r)} value={roleId(r)}>{roleName(r)}</option>)}
          </select>
        </label>

        <label>Assignment Type
          <select value={type} onChange={e => setType(e.target.value as "PRIMARY" | "SECONDARY")}><option value="PRIMARY">Primary</option><option value="SECONDARY">Secondary</option></select>
        </label>

        {selectedAvailable && selectableRoles.length === 0 && <div className="dashboard-error"><AlertTriangle size={16}/><span>This employee already has all available job roles assigned. No duplicate role can be created.</span></div>}
        {saveError && <div className="dashboard-error"><AlertTriangle size={16}/><span>{saveError}</span></div>}

        <div className="manager-modal-actions"><button type="button" className="dashboard-secondary-btn" onClick={() => setShow(false)}>Cancel</button><button className="dashboard-primary-btn" disabled={saving || !employeeId || !jobRoleId}>{saving ? <Loader2 className="spin" size={15}/> : <UserPlus size={15}/>} {saving ? "Assigning…" : "Assign to My Team"}</button></div>
      </form></div>}
    </ManagerPage>
  );
}
