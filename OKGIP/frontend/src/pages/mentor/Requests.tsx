import React from "react";
import MentorLayout from "@/components/layout/MentorLayout";
import mentorshipService, { MentorshipRequest } from "@/services/mentorshipService";

export default function MentorRequests() {
  const [rows,setRows]=React.useState<MentorshipRequest[]>([]); const [loading,setLoading]=React.useState(true); const [error,setError]=React.useState("");
  const load=React.useCallback(async()=>{setLoading(true);setError("");try{setRows(await mentorshipService.getRequests())}catch(e:any){setError(e?.response?.data?.message||"Unable to load mentorship requests.")}finally{setLoading(false)}},[]);
  React.useEffect(()=>{load()},[load]);
  const action=async(id:number, type:"accept"|"reject")=>{try{if(type==="accept")await mentorshipService.acceptRequest(id);else await mentorshipService.rejectRequest(id);await load()}catch(e:any){setError(e?.response?.data?.message||`Unable to ${type} request.`)}};
  return <MentorLayout title="Mentorship Requests"><div className="mb-6"><h2 className="text-2xl font-bold">Mentorship Requests</h2><p className="text-slate-500 mt-1">Live requests from the mentorship API.</p></div>{error&&<div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm">{error}</div>}{loading?<p>Loading...</p>:rows.length===0?<div className="bg-white border rounded-2xl p-10 text-center text-slate-500">No mentorship requests found.</div>:<div className="space-y-3">{rows.map(r=><div key={r.requestId} className="bg-white border rounded-2xl p-5 flex items-center justify-between gap-4"><div><div className="font-semibold">{r.menteeName} → {r.mentorName}</div><div className="text-sm text-slate-500 mt-1">{r.skillName}{r.message?` · ${r.message}`:""}</div><span className="inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full bg-slate-100">{r.status}</span></div>{r.status==="PENDING"&&<div className="flex gap-2"><button onClick={()=>action(r.requestId,"accept")} className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm">Accept</button><button onClick={()=>action(r.requestId,"reject")} className="px-4 py-2 rounded-lg border text-sm">Reject</button></div>}</div>)}</div>}</MentorLayout>;
}
