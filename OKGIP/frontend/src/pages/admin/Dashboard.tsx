import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Activity, AlertTriangle, BarChart3, Bell, BookOpen, CheckCircle2, ChevronRight,
  Database, FileClock, FileDown, FileText, Gauge, HardDrive, KeyRound, LayoutDashboard,
  LogOut, Menu, Moon, Network, Plus, RefreshCw, Search, Settings, Shield, ShieldCheck,
  Sun, UserCog, Users, X, Trash2, Edit3, Save, Server, LockKeyhole, Cloud, ClipboardList,
  Building2, BriefcaseBusiness, Boxes, CircleHelp, Download, Upload, Eye
} from "lucide-react";
import API from "@/api/axios";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["users", "User Management", Users],
  ["roles", "Role Management", UserCog],
  ["permissions", "Permission Matrix", KeyRound],
  ["system-settings", "System Settings", Settings],
  ["security", "Security Center", ShieldCheck],
  ["audit-logs", "Audit Logs", FileClock],
  ["integrations", "Integrations", Network],
  ["system-health", "System Health", Gauge],
  ["backup", "Backup & Restore", HardDrive],
  ["reports", "Reports & Analytics", BarChart3],
  ["notifications", "Notification Settings", Bell],
] as const;

type PageKey = typeof NAV[number][0];

type AnyMap = Record<string, any>;

const api = {
  dashboard: () => API.get<AnyMap>("/admin/dashboard").then(r => r.data),
  users: () => API.get<AnyMap[]>("/admin/users").then(r => r.data),
  roles: () => API.get<AnyMap[]>("/admin/roles").then(r => r.data),
  departments: () => API.get<AnyMap[]>("/admin/departments").then(r => r.data),
  skills: () => API.get<AnyMap[]>("/admin/skills").then(r => r.data),
  jobRoles: () => API.get<AnyMap[]>("/admin/job-roles").then(r => r.data),
  trainings: () => API.get<AnyMap[]>("/admin/trainings").then(r => r.data),
  gaps: () => API.get<AnyMap[]>("/admin/gaps").then(r => r.data),
  assessments: () => API.get<AnyMap[]>("/admin/assessments").then(r => r.data),
  mentorships: () => API.get<AnyMap[]>("/admin/mentorships").then(r => r.data),
  health: () => API.get<AnyMap>("/admin/system/health").then(r => r.data),
  configuration: () => API.get<AnyMap>("/admin/system/configuration").then(r => r.data),
};

function fmt(value: any) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number") return Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return String(value).replaceAll("ROLE_", "").replaceAll("_", " ");
}

function pct(value: any) { return `${Number(value || 0).toFixed(1)}%`; }

function useAdminData<T>(loader: () => Promise<T>, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true); setError("");
    try { setData(await loader()); }
    catch (e: any) { setError(e?.response?.data?.message || e?.message || "Unable to load data from the backend."); }
    finally { setLoading(false); }
  }, [loader, enabled]);
  useEffect(() => { void load(); }, [load]);
  return { data, loading, error, reload: load };
}

function Loading() { return <div className="adm-state"><RefreshCw className="spin" size={20}/> Loading live data…</div>; }
function ErrorBox({ message, retry }: { message: string; retry?: () => void }) { return <div className="adm-error"><AlertTriangle size={18}/><div><strong>Backend request failed</strong><div>{message}</div>{retry && <button onClick={retry}>Retry</button>}</div></div>; }
function Empty({ text = "No records are available in the database." }) { return <div className="adm-empty"><Database size={22}/><span>{text}</span></div>; }

function Table({ columns, rows }: { columns: { key: string; label: string }[]; rows: AnyMap[] }) {
  if (!rows.length) return <Empty />;
  return <div className="table-wrap"><table><thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={r.id ?? r.employeeId ?? r.roleId ?? r.skillId ?? r.jobRoleId ?? r.trainingId ?? r.attemptId ?? i}>{columns.map(c => <td key={c.key}>{fmt(r[c.key])}</td>)}</tr>)}</tbody></table></div>;
}

function BarList({ items, valueKey = "count", labelKey = "name" }: { items: AnyMap[]; valueKey?: string; labelKey?: string }) {
  const max = Math.max(...items.map(x => Number(x[valueKey] || 0)), 1);
  if (!items.length) return <Empty />;
  return <div className="bars">{items.map((x, i) => <div className="bar-row" key={`${x[labelKey]}-${i}`}><div className="bar-label"><span>{fmt(x[labelKey])}</span><b>{fmt(x[valueKey])}</b></div><div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(2, Number(x[valueKey] || 0) / max * 100)}%` }}/></div></div>)}</div>;
}

function Stat({ title, value, icon: Icon }: { title: string; value: any; icon: React.ElementType }) {
  return <div className="stat"><div className="stat-icon"><Icon size={19}/></div><div><div className="stat-title">{title}</div><div className="stat-value">{fmt(value)}</div></div></div>;
}

function Modal({ title, children, close }: { title: string; children: React.ReactNode; close: () => void }) {
  return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><h3>{title}</h3><button onClick={close}><X size={18}/></button></div>{children}</div></div>;
}

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, email } = useAuth();
  const key = (location.pathname.split("/")[2] || "dashboard") as PageKey;
  const page: PageKey = NAV.some(n => n[0] === key) ? key : "dashboard";
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");

  const go = (p: PageKey) => navigate(p === "dashboard" ? "/admin" : `/admin/${p}`);

  return <div className={`admin-app ${dark ? "dark" : ""}`}>
    <style>{CSS}</style>
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon">✦</div><strong>OKIP</strong></div>
      <nav>{NAV.map(([id, label, Icon]) => <button key={id} className={page === id ? "nav active" : "nav"} onClick={() => go(id)}><Icon size={18}/><span>{label}</span></button>)}</nav>
      <div className="side-bottom"><button className="nav" onClick={() => go("system-settings")}><Settings size={18}/><span>Settings</span></button><button className="nav" onClick={logout}><LogOut size={18}/><span>Logout</span></button></div>
    </aside>
    <main className="main">
      <header className="header"><div className="crumb">Dashboard <ChevronRight size={13}/> <b>{NAV.find(n => n[0] === page)?.[1]}</b></div><div className="header-actions"><div className="search"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users, skills, reports…"/></div><button className="icon-btn"><Bell size={18}/></button><button className="icon-btn" onClick={() => setDark(v => !v)}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button><div className="profile"><div className="avatar"><Shield size={17}/></div><div><b>System Administrator</b><small>{email || "Authenticated administrator"}</small></div></div></div></header>
      <div className="content">{page === "dashboard" && <DashboardPage go={go}/>} {page === "users" && <UsersPage search={search}/>} {page === "roles" && <RolesPage/>} {page === "permissions" && <PermissionsPage/>} {page === "system-settings" && <ConfigPage/>} {page === "security" && <SecurityPage/>} {page === "audit-logs" && <AuditPage/>} {page === "integrations" && <IntegrationsPage/>} {page === "system-health" && <HealthPage/>} {page === "backup" && <BackupPage/>} {page === "reports" && <ReportsPage/>} {page === "notifications" && <NotificationsPage/>}</div>
    </main>
  </div>;
};

function PageHead({ title, description, refresh }: { title: string; description: string; refresh?: () => void }) {
  return <div className="page-head"><div><div className="eyebrow">ADMINISTRATION</div><h1>{title}</h1><p>{description}</p></div>{refresh && <button className="primary" onClick={refresh}><RefreshCw size={16}/> Refresh</button>}</div>;
}

function DashboardPage({ go }: { go: (p: PageKey) => void }) {
  const loader = useCallback(() => api.dashboard(), []); const q = useAdminData(loader);
  const d = q.data || {};
  return <>
    <PageHead title="System Administration Dashboard" description="Live platform, access, security and operational information from the backend." refresh={q.reload}/>
    {q.loading ? <Loading/> : q.error ? <ErrorBox message={q.error} retry={q.reload}/> : <>
      <div className="stats-grid"><Stat title="Total Users" value={d.totalUsers} icon={Users}/><Stat title="Active Users" value={d.activeUsers} icon={CheckCircle2}/><Stat title="Pending Users" value={d.pendingUsers} icon={AlertTriangle}/><Stat title="Roles" value={d.roles?.length} icon={UserCog}/><Stat title="Skills" value={d.skills} icon={Boxes}/><Stat title="Certifications" value={d.certifications} icon={FileText}/></div>
      <div className="grid-2"><section className="card"><CardTitle title="User Distribution by Role" action="Manage Roles" onClick={() => go("roles")}/><BarList items={d.roles || []}/></section><section className="card"><CardTitle title="Users by Department" action="View Users" onClick={() => go("users")}/><BarList items={d.departments || []}/></section></div>
      <div className="grid-3"><section className="card"><CardTitle title="Training Status"/><BarList items={d.trainingStatuses || []}/></section><section className="card"><CardTitle title="Assessment Attempts"/><BarList items={d.assessmentTypes || []}/></section><section className="card"><CardTitle title="Organization Data"><div className="mini-stats"><span><b>{fmt(d.jobRoles)}</b> job roles</span><span><b>{fmt(d.trainings)}</b> trainings</span><span><b>{fmt(d.activeMentorships)}</b> active mentorships</span></div></CardTitle><div className="callout"><Activity size={18}/><div><b>Live database snapshot</b><p>All displayed values are calculated from current application records.</p></div></div></section></div>
    </>}
  </>;
}
function CardTitle({ title, action, onClick, children }: { title: string; action?: string; onClick?: () => void; children?: React.ReactNode }) { return <div className="card-title"><h2>{title}</h2>{action && <button onClick={onClick}>{action}<ChevronRight size={14}/></button>}{children}</div>; }

function UsersPage({ search }: { search: string }) {
  const q = useAdminData(useCallback(() => api.users(), [])); const roles = useAdminData(useCallback(() => api.roles(), [])); const depts = useAdminData(useCallback(() => api.departments(), []));
  const [modal, setModal] = useState(false); const [selected, setSelected] = useState<AnyMap | null>(null); const [status, setStatus] = useState(""); const [role, setRole] = useState(""); const [message, setMessage] = useState("");
  const users = useMemo(() => (q.data || []).filter(u => `${u.name} ${u.email} ${u.employeeCode} ${u.department} ${u.role}`.toLowerCase().includes(search.toLowerCase())), [q.data, search]);
  const updateStatus = async (u: AnyMap, s: string) => { setMessage(""); try { await API.put(`/admin/users/${u.employeeId}/status`, null, { params: { status: s } }); await q.reload(); } catch (e:any) { setMessage(e?.response?.data?.message || "Status update failed."); } };
  const updateRole = async () => { if (!selected || !role) return; try { await API.put(`/admin/users/${selected.employeeId}/role/${role}`); setModal(false); await q.reload(); } catch (e:any) { setMessage(e?.response?.data?.message || "Role update failed."); } };
  return <><PageHead title="User Management" description="Manage real employee accounts, status and role assignments stored in the database." refresh={q.reload}/>{message && <div className="notice">{message}</div>}{q.loading ? <Loading/> : q.error ? <ErrorBox message={q.error} retry={q.reload}/> : <section className="card"><div className="toolbar"><span>{users.length} matching records</span><button className="primary" onClick={() => {setSelected(null);setModal(true)}}><Plus size={16}/> Create User</button></div><Table columns={[{key:"employeeCode",label:"Code"},{key:"name",label:"Name"},{key:"email",label:"Email"},{key:"department",label:"Department"},{key:"role",label:"Role"},{key:"status",label:"Status"},{key:"createdAt",label:"Created"}]} rows={users}/><div className="actions-row">{users.slice(0, 20).map(u => <div className="action-chip" key={u.employeeId}><span>{u.name}</span><select value={u.status || ""} onChange={e => updateStatus(u,e.target.value)}><option value="PENDING">PENDING</option><option value="APPROVED">APPROVED</option><option value="REJECTED">REJECTED</option></select><button onClick={() => {setSelected(u);setRole(String(u.roleId || ""));setModal(true)}} title="Change role"><Edit3 size={14}/></button></div>)}</div></section>}{modal && selected && <Modal title={`Change role — ${selected.name}`} close={() => setModal(false)}><select className="field" value={role} onChange={e => setRole(e.target.value)}>{(roles.data || []).map(r => <option key={r.roleId} value={r.roleId}>{fmt(r.roleName)}</option>)}</select><button className="primary full" onClick={updateRole}><Save size={16}/> Save role</button></Modal>}{modal && !selected && <CreateUserModal departments={depts.data || []} roles={roles.data || []} close={() => setModal(false)} after={q.reload}/>}</>;
}

function CreateUserModal({ departments, roles, close, after }: { departments: AnyMap[]; roles: AnyMap[]; close: () => void; after: () => Promise<any> }) {
  const [form,setForm]=useState({firstName:"",lastName:"",officialEmail:"",password:"",departmentId:"",role:""}); const [error,setError]=useState("");
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setError("");try{await API.post("/admin/users",{...form,departmentId:Number(form.departmentId)});await after();close();}catch(x:any){setError(x?.response?.data?.message||"User creation failed.")}};
  return <Modal title="Create organization user" close={close}><form onSubmit={submit} className="form-grid">{(["firstName","lastName","officialEmail","password"] as const).map(k=><input key={k} className="field" required type={k==="password"?"password":"text"} placeholder={k} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>)}<select className="field" required value={form.departmentId} onChange={e=>setForm({...form,departmentId:e.target.value})}><option value="">Select department</option>{departments.map(d=><option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}</select><select className="field" required value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="">Select role</option>{roles.map(r=><option key={r.roleId} value={r.roleName}>{fmt(r.roleName)}</option>)}</select>{error&&<div className="form-error">{error}</div>}<button className="primary full" type="submit"><Save size={16}/> Create user</button></form></Modal>;
}

function RolesPage(){const q=useAdminData(useCallback(()=>api.roles(),[]));return <><PageHead title="Role Management" description="Live roles and the number of database users assigned to each role." refresh={q.reload}/>{q.loading?<Loading/>:q.error?<ErrorBox message={q.error} retry={q.reload}/>:<section className="card"><Table columns={[{key:"roleName",label:"Role"},{key:"description",label:"Description"},{key:"userCount",label:"Users"},{key:"createdAt",label:"Created"}]} rows={q.data||[]}/></section>}</>}
function PermissionsPage(){return <><PageHead title="Permission Matrix" description="Role-based access is enforced by Spring Security in the current backend."/><section className="card"><div className="permission-grid">{["ADMIN","HR","MANAGER","EMPLOYEE","MENTOR"].map(r=><div key={r} className="permission-card"><Shield size={18}/><h3>{r}</h3><p>Backend authorization role</p><span className="secure">Protected</span></div>)}</div><div className="callout"><LockKeyhole size={18}/><div><b>Access control is backend enforced</b><p>Admin endpoints require an authenticated ADMIN role; the frontend does not grant permissions by itself.</p></div></div></section></>}
function ConfigPage(){const q=useAdminData(useCallback(()=>api.configuration(),[]));return <><PageHead title="System Settings" description="Runtime configuration read directly from Spring Boot environment properties." refresh={q.reload}/>{q.loading?<Loading/>:q.error?<ErrorBox message={q.error} retry={q.reload}/>:<section className="card"><Table columns={[{key:"key",label:"Setting"},{key:"value",label:"Current value"}]} rows={Object.entries(q.data||{}).map(([key,value])=>({key,value}))}/></section>}</>}
function SecurityPage(){const q=useAdminData(useCallback(()=>api.health(),[]));return <><PageHead title="Security Center" description="Current authentication and platform security indicators exposed by the backend." refresh={q.reload}/>{q.loading?<Loading/>:q.error?<ErrorBox message={q.error} retry={q.reload}/>:<div className="grid-3"><section className="card security"><ShieldCheck size={28}/><h2>JWT Authentication</h2><p>Configured: {fmt(q.data?.jwtConfigured ?? "Not exposed")}</p><span className="secure">Backend protected</span></section><section className="card security"><LockKeyhole size={28}/><h2>Role Access</h2><p>ADMIN endpoints require ADMIN authority.</p><span className="secure">Enforced</span></section><section className="card security"><Database size={28}/><h2>Database</h2><p>{fmt(q.data?.database)}</p><span className={q.data?.databaseConnected?"secure":"danger"}>{q.data?.databaseConnected?"Connected":"Disconnected"}</span></section></div>}</>}
function AuditPage(){const q=useAdminData(useCallback(()=>api.users(),[]));const rows=(q.data||[]).flatMap(u=>[{time:u.updatedAt||u.createdAt,user:u.name,action:"Account record changed",module:"User Management"}]).sort((a,b)=>String(b.time).localeCompare(String(a.time)));return <><PageHead title="Audit Logs" description="Account lifecycle timestamps available from persisted employee records." refresh={q.reload}/>{q.loading?<Loading/>:q.error?<ErrorBox message={q.error} retry={q.reload}/>:<section className="card"><div className="callout"><FileClock size={18}/><div><b>Audit-log limitation</b><p>The current backend does not contain a dedicated audit_log table. This view therefore shows persisted employee create/update timestamps only; it does not invent security events.</p></div></div><Table columns={[{key:"time",label:"Time"},{key:"user",label:"User"},{key:"action",label:"Event"},{key:"module",label:"Module"}]} rows={rows}/></section>}</>}
function IntegrationsPage(){const q=useAdminData(useCallback(()=>api.configuration(),[]));return <><PageHead title="Integrations" description="Integration configuration detected from the running backend." refresh={q.reload}/>{q.loading?<Loading/>:q.error?<ErrorBox message={q.error} retry={q.reload}/>:<section className="card integration-grid"><Integration name="PostgreSQL" icon={Database} state={q.data?.databaseUrl?"Configured":"Not configured"}/><Integration name="Gemini / Spring AI" icon={Cloud} state={q.data?.geminiConfigured?"Configured":"Not configured"}/><Integration name="JWT" icon={KeyRound} state={q.data?.jwtConfigured?"Configured":"Not configured"}/></section>}</>}
function Integration({name,icon:Icon,state}:{name:string;icon:React.ElementType;state:string}){return <div className="integration"><Icon size={22}/><div><b>{name}</b><small>{state}</small></div><span className={state==="Configured"?"secure":"muted"}>{state}</span></div>}
function HealthPage(){const q=useAdminData(useCallback(()=>api.health(),[]));return <><PageHead title="System Health" description="Measured runtime and database health from the Spring Boot process." refresh={q.reload}/>{q.loading?<Loading/>:q.error?<ErrorBox message={q.error} retry={q.reload}/>:<div className="stats-grid"><Stat title="Database" value={q.data?.databaseConnected?"Connected":"Disconnected"} icon={Database}/><Stat title="Response Time" value={`${fmt(q.data?.responseTimeMs)} ms`} icon={Activity}/><Stat title="Memory Used" value={`${fmt(q.data?.memoryUsedMb)} MB`} icon={Server}/><Stat title="Memory Usage" value={pct(q.data?.memoryUsagePercent)} icon={Gauge}/><Stat title="Processors" value={q.data?.processors} icon={Boxes}/><Stat title="Uptime" value={`${fmt(q.data?.uptimeSeconds)} s`} icon={Activity}/></div>}</>}
function BackupPage(){const [data,setData]=useState<any>(null);const [error,setError]=useState("");const run=async()=>{try{const [u,s,j,t,g,a,m]=await Promise.all([api.users(),api.skills(),api.jobRoles(),api.trainings(),api.gaps(),api.assessments(),api.mentorships()]);setData({generatedAt:new Date().toISOString(),users:u,skills:s,jobRoles:j,trainings:t,gaps:g,assessments:a,mentorships:m});setError("")}catch(e:any){setError(e?.response?.data?.message||"Snapshot failed.")}};return <><PageHead title="Backup & Restore" description="Create a downloadable JSON snapshot of current application records." refresh={run}/><section className="card"><div className="callout"><HardDrive size={18}/><div><b>Application-data snapshot</b><p>This exports records available through the authenticated admin APIs. It is not a physical PostgreSQL backup.</p></div></div><button className="primary" onClick={run}><Download size={16}/> Generate snapshot</button>{error&&<div className="form-error">{error}</div>}{data&&<div className="backup-result"><CheckCircle2 size={20}/><span>Snapshot ready — {data.users.length} users, {data.skills.length} skills, {data.jobRoles.length} job roles, {data.trainings.length} trainings.</span><button onClick={()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`okgip-admin-snapshot-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href)}}><FileDown size={16}/> Download JSON</button></div>}</section></>}
function ReportsPage() {
  const [type, setType] = useState("users");

  const loaders: Record<string, () => Promise<AnyMap[]>> = {
    users: api.users,
    skills: api.skills,
    gaps: api.gaps,
    trainings: api.trainings,
    assessments: api.assessments,
  };

  const loader = useCallback(
    () => loaders[type](),
    [type]
  );

  const q = useAdminData<AnyMap[]>(loader);

  const rows: AnyMap[] = q.data ?? [];

  const download = () => {
    if (rows.length === 0) {
      return;
    }

    const headers = Object.keys(rows[0]);

    const csv =
      headers.map((key) => `"${key}"`).join(",") +
      "\n" +
      rows
        .map((row) =>
          headers
            .map(
              (key) =>
                `"${String(
                  row[key] ?? ""
                ).replaceAll('"', '""')}"`
            )
            .join(",")
        )
        .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `okgip-${type}-report.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const columns = rows.length
    ? Object.keys(rows[0])
        .slice(0, 8)
        .map((key) => ({
          key,
          label: key,
        }))
    : [];

  return (
    <>
      <PageHead
        title="Reports & Analytics"
        description="Export live organization records as CSV reports."
        refresh={q.reload}
      />

      <section className="card">
        <div className="toolbar">
          <span>
            {rows.length} records
          </span>

          <div style={{ display: "flex", gap: "10px" }}>
            <select
              className="field compact"
              value={type}
              onChange={(e) =>
                setType(e.target.value)
              }
            >
              <option value="users">
                Users
              </option>

              <option value="skills">
                Skills
              </option>

              <option value="gaps">
                Knowledge Gaps
              </option>

              <option value="trainings">
                Training
              </option>

              <option value="assessments">
                Assessments
              </option>
            </select>

            <button
              className="primary"
              onClick={download}
              disabled={rows.length === 0}
            >
              <FileDown size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {q.loading ? (
          <Loading />
        ) : q.error ? (
          <ErrorBox
            message={q.error}
            retry={q.reload}
          />
        ) : (
          <Table
            columns={columns}
            rows={rows.slice(0, 100)}
          />
        )}
      </section>
    </>
  );
}
function NotificationsPage(){return <><PageHead title="Notification Settings" description="Notification providers available in the current backend configuration."/><section className="card"><div className="integration-grid"><Integration name="Email / JavaMailSender" icon={Bell} state="Not configured in current backend"/><Integration name="Firebase Cloud Messaging" icon={Bell} state="Not configured in current backend"/><Integration name="Twilio SMS" icon={Bell} state="Not configured in current backend"/></div><div className="callout"><CircleHelp size={18}/><div><b>No fake notification status</b><p>The current source does not expose provider configuration for these channels, so the page reports that honestly instead of displaying invented delivery metrics.</p></div></div></section></>}

const CSS = `
*{box-sizing:border-box}.admin-app{min-height:100vh;background:#f7f8fc;color:#0f172a;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;display:flex}.admin-app.dark{background:#111827;color:#e5e7eb}.sidebar{width:252px;min-width:252px;background:#fff;border-right:1px solid #e5e7eb;display:flex;flex-direction:column;min-height:100vh}.dark .sidebar,.dark .header,.dark .card{background:#18202f;color:#e5e7eb;border-color:#334155}.brand{height:76px;display:flex;align-items:center;gap:12px;padding:0 28px;border-bottom:1px solid #eef2f7;font-size:22px}.brand-icon{width:40px;height:40px;border-radius:13px;background:#7c3aed;color:#fff;display:grid;place-items:center;font-size:22px}.sidebar nav{padding:18px 12px;flex:1}.nav{width:100%;height:43px;border:0;background:transparent;border-radius:11px;display:flex;align-items:center;gap:13px;padding:0 15px;color:#475569;font-size:13px;cursor:pointer;margin-bottom:5px;text-align:left}.nav:hover{background:#f5f3ff;color:#6d28d9}.nav.active{background:#f0e9ff;color:#6d28d9;font-weight:700}.side-bottom{border-top:1px solid #eef2f7;padding:14px 12px}.main{flex:1;min-width:0}.header{height:76px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;padding:0 30px;gap:20px}.crumb{display:flex;align-items:center;gap:7px;color:#64748b;font-size:13px}.header-actions{display:flex;align-items:center;gap:9px}.search{width:250px;height:40px;border:1px solid #e2e8f0;background:#f8fafc;border-radius:11px;display:flex;align-items:center;gap:8px;padding:0 11px;color:#94a3b8}.search input{border:0;outline:0;background:transparent;width:100%;font-size:12px}.icon-btn{border:0;background:transparent;width:38px;height:38px;border-radius:10px;display:grid;place-items:center;color:#64748b;cursor:pointer}.profile{border-left:1px solid #e2e8f0;padding-left:12px;display:flex;align-items:center;gap:9px}.avatar{width:37px;height:37px;border-radius:50%;background:#ede9fe;color:#7c3aed;display:grid;place-items:center}.profile b{display:block;font-size:11px}.profile small{display:block;color:#64748b;font-size:10px;margin-top:2px}.content{padding:28px 30px;max-width:1600px;margin:auto}.page-head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:22px}.eyebrow{font-size:10px;font-weight:800;color:#7c3aed;letter-spacing:.08em}.page-head h1{font-size:29px;line-height:1.15;margin:6px 0 7px}.page-head p{margin:0;color:#64748b;font-size:13px}.dark .page-head p,.dark .crumb{color:#94a3b8}.primary{border:0;background:#7c3aed;color:#fff;border-radius:10px;padding:10px 14px;font-size:12px;font-weight:700;display:inline-flex;align-items:center;gap:7px;cursor:pointer}.primary:disabled{opacity:.5;cursor:not-allowed}.full{width:100%;justify-content:center;margin-top:8px}.stats-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:14px;margin-bottom:18px}.stat{background:#fff;border:1px solid #e5e7eb;border-radius:15px;padding:17px;display:flex;gap:12px;align-items:center;min-height:102px}.dark .stat{background:#18202f;border-color:#334155}.stat-icon{width:39px;height:39px;border-radius:12px;background:#f1eafe;color:#7c3aed;display:grid;place-items:center}.stat-title{font-size:10px;text-transform:uppercase;color:#64748b;font-weight:700}.stat-value{font-size:22px;font-weight:800;margin-top:4px}.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px}.card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:20px;box-shadow:0 1px 2px rgba(15,23,42,.03);min-width:0}.card-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:17px}.card-title h2{font-size:16px;margin:0}.card-title button{border:0;background:transparent;color:#7c3aed;font-size:11px;font-weight:700;display:flex;align-items:center;gap:4px;cursor:pointer}.bars{display:flex;flex-direction:column;gap:13px}.bar-label{display:flex;justify-content:space-between;font-size:11px;margin-bottom:6px}.bar-label span{color:#475569}.dark .bar-label span{color:#cbd5e1}.bar-track{height:8px;background:#edf0f5;border-radius:99px;overflow:hidden}.bar-fill{height:100%;background:#7c3aed;border-radius:99px}.mini-stats{display:flex;gap:8px;flex-wrap:wrap}.mini-stats span{font-size:11px;color:#64748b;background:#f8fafc;border:1px solid #e5e7eb;padding:8px 10px;border-radius:9px}.dark .mini-stats span{background:#111827;border-color:#334155}.callout{margin-top:15px;border:1px solid #e9d5ff;background:#faf5ff;border-radius:12px;padding:12px;display:flex;gap:10px;align-items:flex-start;color:#6d28d9;font-size:12px}.callout p{margin:4px 0 0;color:#64748b;line-height:1.5}.table-wrap{overflow:auto;border:1px solid #e5e7eb;border-radius:11px}.table-wrap table{width:100%;border-collapse:collapse;min-width:700px}.table-wrap th,.table-wrap td{padding:12px 13px;border-bottom:1px solid #edf0f3;text-align:left;font-size:11px;vertical-align:top}.table-wrap th{background:#f8fafc;color:#64748b;text-transform:uppercase;font-size:9px;letter-spacing:.04em}.dark .table-wrap th{background:#111827}.table-wrap tr:last-child td{border-bottom:0}.toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;color:#64748b;font-size:11px}.actions-row{display:flex;flex-direction:column;gap:7px;margin-top:15px}.action-chip{display:flex;align-items:center;gap:8px;border:1px solid #edf0f3;border-radius:9px;padding:7px 9px;font-size:11px}.action-chip span{flex:1}.action-chip select,.field{border:1px solid #dbe1e8;border-radius:8px;background:#fff;padding:9px 10px;font-size:12px;outline:none}.field.compact{width:180px}.notice{background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:10px;padding:10px 12px;font-size:12px;margin-bottom:15px}.adm-state,.adm-empty{display:flex;justify-content:center;align-items:center;gap:9px;padding:45px;color:#64748b;font-size:12px}.adm-error{display:flex;gap:10px;padding:15px;border:1px solid #fecaca;background:#fff1f2;color:#991b1b;border-radius:12px;font-size:12px}.adm-error button{margin-top:8px;border:0;background:#991b1b;color:#fff;border-radius:7px;padding:6px 9px;font-size:11px}.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.modal-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.42);display:grid;place-items:center;z-index:50;padding:20px}.modal{background:#fff;border-radius:16px;width:min(500px,100%);padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.2)}.modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}.modal-head h3{margin:0;font-size:17px}.modal-head button{border:0;background:#f1f5f9;border-radius:8px;width:32px;height:32px;display:grid;place-items:center}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.form-grid .field:nth-child(3),.form-grid .field:nth-child(4){grid-column:span 2}.form-error{grid-column:span 2;background:#fff1f2;color:#991b1b;padding:9px;border-radius:8px;font-size:11px}.security{text-align:center}.security svg{color:#7c3aed}.security h2{font-size:15px;margin:12px 0 5px}.security p{font-size:11px;color:#64748b;min-height:34px}.secure{display:inline-flex;padding:5px 8px;border-radius:99px;background:#ecfdf5;color:#047857;font-size:10px;font-weight:700}.danger{display:inline-flex;padding:5px 8px;border-radius:99px;background:#fff1f2;color:#be123c;font-size:10px;font-weight:700}.muted{display:inline-flex;padding:5px 8px;border-radius:99px;background:#f1f5f9;color:#64748b;font-size:10px;font-weight:700}.permission-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.permission-card{border:1px solid #e5e7eb;border-radius:12px;padding:15px}.permission-card svg{color:#7c3aed}.permission-card h3{font-size:12px;margin:12px 0 4px}.permission-card p{font-size:10px;color:#64748b}.integration-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.integration{border:1px solid #e5e7eb;border-radius:12px;padding:15px;display:flex;align-items:center;gap:11px}.integration>svg{color:#7c3aed}.integration div{flex:1}.integration b{display:block;font-size:12px}.integration small{display:block;color:#64748b;font-size:10px;margin-top:3px}.backup-result{margin-top:15px;padding:12px;border:1px solid #bbf7d0;background:#f0fdf4;color:#166534;border-radius:10px;display:flex;gap:8px;align-items:center;font-size:11px}.backup-result span{flex:1}.backup-result button{border:0;background:#166534;color:#fff;border-radius:7px;padding:7px 9px;font-size:10px;display:flex;gap:5px;align-items:center}@media(max-width:1200px){.stats-grid{grid-template-columns:repeat(3,1fr)}.permission-grid{grid-template-columns:repeat(3,1fr)}.integration-grid{grid-template-columns:1fr 1fr}}@media(max-width:900px){.sidebar{width:70px;min-width:70px}.brand{padding:0 15px}.brand strong,.nav span{display:none}.nav{justify-content:center;padding:0}.content{padding:20px}.header{padding:0 18px}.crumb{display:none}.search{width:180px}.grid-2,.grid-3{grid-template-columns:1fr}.profile div:not(.avatar){display:none}}@media(max-width:620px){.stats-grid{grid-template-columns:1fr 1fr}.form-grid{grid-template-columns:1fr}.form-grid .field:nth-child(3),.form-grid .field:nth-child(4),.form-error{grid-column:auto}.permission-grid,.integration-grid{grid-template-columns:1fr}.header-actions .icon-btn{display:none}}
`;

export default AdminDashboard;
