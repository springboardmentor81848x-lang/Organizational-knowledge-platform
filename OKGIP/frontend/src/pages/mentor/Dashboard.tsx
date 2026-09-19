import React from "react";
import { Users, UserCheck, CalendarDays, CheckCircle2, Bell, Award, Clock3 } from "lucide-react";
import MentorLayout from "@/components/layout/MentorLayout";
import mentorshipService, { KnowledgeSession, MentorshipRequest } from "@/services/mentorshipService";
import notificationService from "@/services/notificationService";
import { getMySkills, EmployeeSkill } from "@/services/skillService";

export default function MentorDashboard() {
  const [requests, setRequests] = React.useState<MentorshipRequest[]>([]);
  const [sessions, setSessions] = React.useState<KnowledgeSession[]>([]);
  const [skills, setSkills] = React.useState<EmployeeSkill[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [r, s, sk, n] = await Promise.all([
        mentorshipService.getMentorRequests(),
        mentorshipService.getSessions(),
        getMySkills(),
        notificationService.getMyNotifications(),
      ]);
      setRequests(r); setSessions(s); setSkills(sk); setUnread(n.filter(x => !x.read).length);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Unable to load mentor dashboard data.");
    } finally { setLoading(false); }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const pending = requests.filter(r => r.status === "PENDING");
  const accepted = requests.filter(r => r.status === "ACCEPTED");
  const scheduled = sessions.filter(s => s.status === "SCHEDULED");
  const completed = sessions.filter(s => s.status === "COMPLETED");
  const menteeCount = new Set(accepted.map(r => r.menteeId)).size;

  return (
    <MentorLayout title="Mentor Dashboard">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><span className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">MENTOR WORKSPACE</span><h2 className="mt-3 text-3xl font-bold text-slate-900">Welcome to your Mentor Dashboard</h2><p className="mt-2 text-slate-500">Guide employees, share expertise and help close skill gaps.</p></div>
        <button onClick={load} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Refresh</button>
      </div>
      {error && <div className="mb-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <Stat icon={<Users size={19}/>} label="Active Mentees" value={loading ? "…" : menteeCount}/>
        <Stat icon={<UserCheck size={19}/>} label="Pending Requests" value={loading ? "…" : pending.length}/>
        <Stat icon={<CalendarDays size={19}/>} label="Upcoming Sessions" value={loading ? "…" : scheduled.length}/>
        <Stat icon={<CheckCircle2 size={19}/>} label="Completed Sessions" value={loading ? "…" : completed.length}/>
        <Stat icon={<Award size={19}/>} label="Expertise Skills" value={loading ? "…" : skills.length}/>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between"><div><h3 className="font-bold text-slate-900">Pending Requests</h3><p className="mt-1 text-xs text-slate-500">Requests waiting for your response.</p></div><UserCheck className="text-purple-600" size={20}/></div>
          <div className="mt-5 space-y-3">
            {pending.slice(0, 4).map(r => <div key={r.requestId} className="rounded-xl border border-slate-200 p-4"><div className="flex justify-between gap-3"><div><p className="text-sm font-semibold">{r.menteeName}</p><p className="mt-1 text-xs text-slate-500">{r.skillName}</p></div><span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">PENDING</span></div><p className="mt-2 text-xs text-slate-500">{r.message || "No message provided."}</p></div>)}
            {!pending.length && <Empty text="No pending mentorship requests."/>}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between"><div><h3 className="font-bold text-slate-900">Upcoming Sessions</h3><p className="mt-1 text-xs text-slate-500">Scheduled knowledge-sharing sessions.</p></div><CalendarDays className="text-purple-600" size={20}/></div>
          <div className="mt-5 space-y-3">
            {scheduled.slice(0, 4).map(s => <div key={s.sessionId} className="rounded-xl border border-slate-200 p-4"><div className="flex justify-between gap-3"><div><p className="text-sm font-semibold">{s.title}</p><p className="mt-1 text-xs text-slate-500">{s.menteeName} · {s.skillName}</p></div><Clock3 size={17} className="text-slate-400"/></div><p className="mt-2 text-xs text-slate-500">{new Date(s.scheduledAt).toLocaleString()} · {s.durationMinutes} min</p></div>)}
            {!scheduled.length && <Empty text="No upcoming sessions."/>}
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between"><div><h3 className="font-bold text-slate-900">Mentor Workspace Status</h3><p className="mt-1 text-xs text-slate-500">Live information from mentorship, skill and notification APIs.</p></div><Bell className="text-purple-600" size={20}/></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3"><Mini label="My Skills" value={skills.length}/><Mini label="Total Sessions" value={sessions.length}/><Mini label="Unread Notifications" value={unread}/></div>
      </section>
    </MentorLayout>
  );
}

function Stat({icon,label,value}:{icon:React.ReactNode;label:string;value:number|string}){return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-3 inline-flex rounded-lg bg-purple-50 p-2 text-purple-600">{icon}</div><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-3xl font-bold text-slate-900">{value}</p></div>}
function Mini({label,value}:{label:string;value:number}){return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-900">{value}</p></div>}
function Empty({text}:{text:string}){return <div className="rounded-xl bg-slate-50 p-7 text-center text-sm text-slate-500">{text}</div>}
