import React, { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Loader2, RefreshCw, Search, Target, Users } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import ManagerPage from "./ManagerPage";
import managerService from "@/services/managerService";
import { TeamAnalytics } from "@/services/analyticsService";

const KnowledgeGapAnalysis: React.FC = () => {
  const [params] = useSearchParams();
  const [team,setTeam]=useState<TeamAnalytics[]>([]); const [selected,setSelected]=useState<any>(null); const [loading,setLoading]=useState(true); const [busy,setBusy]=useState<number|null>(null); const [query,setQuery]=useState("");
  const load=()=>{setLoading(true);managerService.getTeamAnalytics().then(data=>{setTeam(data);const id=Number(params.get("employee"));if(id) openEmployee(id);}).catch(console.error).finally(()=>setLoading(false));};
  const openEmployee=async(id:number)=>{try{setSelected(await managerService.getEmployeeGapAnalysis(id));}catch(e){console.error(e)}};
  useEffect(()=>{load()},[]);
  const rows=useMemo(()=>team.filter(x=>!query||[x.employeeName,x.jobRoleName,x.employeeCode].some(v=>String(v||"").toLowerCase().includes(query.toLowerCase()))).sort((a,b)=>Number(b.gapPercentage)-Number(a.gapPercentage)),[team,query]);
  const run=async(id:number)=>{setBusy(id);try{await managerService.runGapAnalysis(id);await openEmployee(id);await load()}catch(e){console.error(e)}finally{setBusy(null)}};
  return <ManagerPage title="Knowledge Gap Analysis" subtitle="Prioritize employee gaps using the live team and gap-analysis APIs." icon={Activity} active="Knowledge Gap Analysis">
    <div className="manager-page-grid"><section className="manager-card manager-data-card"><div className="manager-toolbar"><div><h2>Gap Risk Queue</h2><p>Sorted by current gap percentage.</p></div><div className="manager-search-large"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search team…"/></div></div>{loading?<div className="manager-loading"><Loader2 className="spin"/> Loading…</div>:<div className="risk-table">{rows.map(x=><div className="risk-row" key={x.employeeId}><div className="risk-person"><div className="manager-avatar"><Users size={15}/></div><div><b>{x.employeeName}</b><small>{x.jobRoleName||x.employeeCode}</small></div></div><div className="risk-meter"><span style={{width:`${Math.min(100,Number(x.gapPercentage||0))}%`}}/></div><strong className={Number(x.gapPercentage)>=50?"danger":""}>{Math.round(Number(x.gapPercentage||0))}%</strong><button onClick={()=>openEmployee(x.employeeId)}>Details</button><button onClick={()=>run(x.employeeId)} disabled={busy===x.employeeId}>{busy===x.employeeId?<RefreshCw className="spin" size={14}/>:"Re-run"}</button></div>)}</div>}</section>
    <section className="manager-card manager-detail-card">{selected?<><div className="detail-header"><div><span>GAP ANALYSIS RESULT</span><h2>{selected.employeeName}</h2><p>{selected.jobRoleName||"Assigned role"}</p></div><Target size={22}/></div><div className="detail-kpis"><div><AlertTriangle/><b>{selected.gapSkills ?? selected.knowledgeGaps?.length ?? "—"}</b><span>Gap Skills</span></div><div><Activity/><b>{selected.overallGapPercentage!=null?`${selected.overallGapPercentage}%`:"—"}</b><span>Overall Gap</span></div><div><Target/><b>{selected.readinessPercentage!=null?`${selected.readinessPercentage}%`:"—"}</b><span>Readiness</span></div></div><div className="gap-list">{(selected.knowledgeGaps||[]).map((g:any)=><div key={g.knowledgeGapId||g.skillName}><div><b>{g.skillName}</b><small>{g.currentProficiency} → {g.requiredProficiency}</small></div><strong>{g.gapPercentage}%</strong></div>)}</div></>:<div className="manager-empty-state compact"><Target size={22}/><h3>Select an employee</h3><p>Open Details to fetch their gap-analysis response.</p></div>}</section></div>
  </ManagerPage>;
}; export default KnowledgeGapAnalysis;
