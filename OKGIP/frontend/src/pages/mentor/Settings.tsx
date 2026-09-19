import React from "react";
import MentorLayout from "@/components/layout/MentorLayout";
import { useAuth } from "@/context/AuthContext";
import { getMySkills } from "@/services/skillService";
import { ShieldCheck, UserRound } from "lucide-react";

export default function Settings(){
 const {email,role,employeeId}=useAuth();const[skillCount,setSkillCount]=React.useState(0);const[loading,setLoading]=React.useState(true);
 React.useEffect(()=>{getMySkills().then(s=>setSkillCount(s.length)).catch(()=>setSkillCount(0)).finally(()=>setLoading(false))},[]);
 return <MentorLayout title="Settings"><div className="mb-6"><h2 className="text-2xl font-bold text-slate-900">Mentor Settings</h2><p className="mt-1 text-slate-500">Authenticated account information used by the mentor workspace.</p></div><div className="grid gap-5 lg:grid-cols-2"><section className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><UserRound className="text-purple-600"/><div><h3 className="font-bold">Account</h3><p className="text-xs text-slate-500">Loaded from the authenticated session.</p></div></div><dl className="mt-6 space-y-4"><Row label="Employee ID" value={employeeId??"—"}/><Row label="Email" value={email??"—"}/><Row label="Application Role" value={role??"—"}/></dl></section><section className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><ShieldCheck className="text-purple-600"/><div><h3 className="font-bold">Mentor Workspace</h3><p className="text-xs text-slate-500">Your expertise remains connected to the employee skill profile.</p></div></div><div className="mt-6 rounded-xl bg-slate-50 p-5"><p className="text-xs text-slate-500">Skills available for mentor matching</p><p className="mt-1 text-3xl font-bold text-slate-900">{loading?"…":skillCount}</p><p className="mt-2 text-xs text-slate-500">Update skills from Skill Profile to change the expertise used by mentor recommendations.</p></div></section></div></MentorLayout>
}
const Row=({label,value}:{label:string;value:string|number})=><div className="flex justify-between gap-4 border-b border-slate-100 pb-3 text-sm"><span className="text-slate-500">{label}</span><span className="font-semibold text-slate-800">{value}</span></div>;
