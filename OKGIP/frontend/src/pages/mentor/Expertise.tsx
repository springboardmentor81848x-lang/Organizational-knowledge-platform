import React from "react";
import MentorLayout from "@/components/layout/MentorLayout";
import { Award, RefreshCw } from "lucide-react";
import { getMySkills, EmployeeSkill } from "@/services/skillService";

export default function Expertise() {
  const [skills, setSkills] = React.useState<EmployeeSkill[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const load = React.useCallback(async () => { setLoading(true); setError(""); try { setSkills(await getMySkills()); } catch (e:any) { setError(e?.response?.data?.message || "Unable to load your expertise."); } finally { setLoading(false); } }, []);
  React.useEffect(() => { load(); }, [load]);
  return <MentorLayout title="Expertise"><div className="mb-6 flex items-end justify-between"><div><h2 className="text-2xl font-bold text-slate-900">My Expertise</h2><p className="mt-1 text-slate-500">Your real skills, proficiency and experience used for mentor matching.</p></div><button onClick={load} className="rounded-xl border bg-white px-3 py-2 text-sm"><RefreshCw size={15} className={loading ? "animate-spin" : ""}/></button></div>{error&&<Notice text={error}/>} {loading?<State text="Loading your skills..."/>:skills.length===0?<State text="No skills found in your employee profile."/>:<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{skills.map(s=><div key={s.employeeSkillId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Award className="text-purple-600" size={21}/><h3 className="mt-4 font-bold text-slate-900">{s.skillName}</h3><p className="mt-1 text-xs text-slate-500">{s.skillCategory}</p><div className="mt-5 flex items-center justify-between"><span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">{s.proficiencyLevel}</span><span className="text-xs text-slate-500">{s.yearsOfExperience ?? 0} years</span></div>{s.lastUsed&&<p className="mt-3 text-[11px] text-slate-400">Last used: {s.lastUsed}</p>}</div>)}</div>}</MentorLayout>
}
const State=({text}:{text:string})=><div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">{text}</div>;
const Notice=({text}:{text:string})=><div className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{text}</div>;
