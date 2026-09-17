import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Award, Bell, BarChart3, BookOpen, CalendarDays, Settings, Users, UserCheck } from "lucide-react";
import mentorshipService, { KnowledgeSession, MentorshipRequest } from "@/services/mentorshipService";

const menuItems = [
  { label: "Dashboard", icon: BarChart3, path: "/mentor/dashboard" },
  { label: "My Mentees", icon: Users, path: "/mentor/mentees" },
  { label: "Mentorship Requests", icon: UserCheck, path: "/mentor/requests" },
  { label: "Knowledge Sessions", icon: CalendarDays, path: "/mentor/sessions" },
  { label: "Knowledge Sharing", icon: BookOpen, path: "/mentor/knowledge-sharing" },
  { label: "Expertise", icon: Award, path: "/mentor/expertise" },
  { label: "Mentorship Analytics", icon: BarChart3, path: "/mentor/analytics" },
  { label: "Notifications", icon: Bell, path: "/mentor/notifications" },
  { label: "Settings", icon: Settings, path: "/mentor/settings" },
];

const WorkspaceSection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [requests, setRequests] = React.useState<MentorshipRequest[]>([]);
  const [sessions, setSessions] = React.useState<KnowledgeSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    Promise.all([mentorshipService.getRequests(), mentorshipService.getSessions()])
      .then(([requestData, sessionData]) => {
        if (!mounted) return;
        setRequests(requestData);
        setSessions(sessionData);
      })
      .catch((err: any) => {
        if (mounted) setError(err?.response?.data?.message || "Unable to load mentor data from the backend.");
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [location.pathname]);

  const incoming = requests.filter((r) => r.status === "PENDING" || r.status === "ACCEPTED");
  const pending = requests.filter((r) => r.status === "PENDING");
  const accepted = requests.filter((r) => r.status === "ACCEPTED");
  const completed = sessions.filter((s) => s.status === "COMPLETED");
  const scheduled = sessions.filter((s) => s.status === "SCHEDULED");

  const titles: Record<string, { title: string; subtitle: string }> = {
    "/mentor/mentees": { title: "My Mentees", subtitle: "Accepted mentorship relationships loaded from the mentorship API." },
    "/mentor/knowledge-sharing": { title: "Knowledge Sharing", subtitle: "Your knowledge-sharing activity and scheduled sessions." },
    "/mentor/expertise": { title: "Expertise", subtitle: "Skills represented in your accepted mentorship relationships." },
    "/mentor/analytics": { title: "Mentorship Analytics", subtitle: "Live metrics calculated from mentorship and session API data." },
    "/mentor/notifications": { title: "Notifications", subtitle: "Pending mentorship actions that need your attention." },
    "/mentor/settings": { title: "Settings", subtitle: "Mentor workspace settings." },
  };
  const page = titles[location.pathname] || titles["/mentor/analytics"];

  const go = (path: string) => navigate(path);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-20 px-5 border-b border-slate-200 flex items-center">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-lg">O</div>
          <div className="ml-3"><div className="font-bold text-xl text-slate-900">OKGIP</div><div className="text-xs text-purple-600 font-medium">MENTOR WORKSPACE</div></div>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.path} onClick={() => go(item.path)} className={`w-full flex items-center rounded-xl px-3 py-3 text-sm font-medium ${location.pathname === item.path ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:bg-slate-50"}`}><Icon className="w-5 h-5" /><span className="ml-3">{item.label}</span></button>;
          })}
        </nav>
        <div className="border-t border-slate-200 p-3"><button onClick={() => go("/mentor/dashboard")} className="w-full py-2 text-sm text-slate-500">← Dashboard</button></div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div><div className="text-sm text-slate-400">Workspace</div><h1 className="text-xl font-semibold text-slate-900">{page.title}</h1></div>
          <button onClick={() => go("/mentor/notifications")} className="relative text-slate-500"><Bell className="w-5 h-5" />{pending.length > 0 && <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-purple-600 text-white text-[9px] flex items-center justify-center">{pending.length}</span>}</button>
        </header>

        <div className="p-8">
          <div className="mb-7"><span className="inline-flex px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold">MENTOR WORKSPACE</span><h2 className="mt-3 text-3xl font-bold text-slate-900">{page.title}</h2><p className="mt-2 text-slate-500">{page.subtitle}</p></div>
          {error && <div className="mb-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          {loading ? <div className="rounded-2xl bg-white border border-slate-200 p-8 text-sm text-slate-500">Loading live mentor data...</div> : (
            <>
              {(location.pathname === "/mentor/mentees" || location.pathname === "/mentor/knowledge-sharing") && (
                <div className="space-y-4">
                  {(location.pathname === "/mentor/mentees" ? accepted : scheduled).map((item) => {
                    if (location.pathname === "/mentor/mentees") {
                      const request = item as any;
                      return (
                        <div key={request.requestId} className="rounded-2xl bg-white border border-slate-200 p-5">
                          <div className="font-semibold text-slate-900">{request.menteeName}</div>
                          <div className="text-sm text-slate-500 mt-1">{request.skillName} · {request.status}</div>
                        </div>
                      );
                    }
                    const session = item as any;
                    return (
                      <div key={session.sessionId} className="rounded-2xl bg-white border border-slate-200 p-5">
                        <div className="font-semibold text-slate-900">{session.title}</div>
                        <div className="text-sm text-slate-500 mt-1">{session.skillName} · {new Date(session.scheduledAt).toLocaleString()} · {session.durationMinutes} min</div>
                      </div>
                    );
                  })}
                  {(location.pathname === "/mentor/mentees" ? accepted : scheduled).length === 0 && (
                    <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-sm text-slate-500">No records available yet.</div>
                  )}
                </div>
              )}

              {location.pathname === "/mentor/expertise" && <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{Array.from(new Set(accepted.map((r) => r.skillName))).map((skill) => <div key={skill} className="rounded-2xl bg-white border border-slate-200 p-5"><Award className="text-purple-600" /><h3 className="mt-3 font-semibold text-slate-900">{skill}</h3><p className="text-sm text-slate-500 mt-1">Shared through active mentorship</p></div>)}{accepted.length === 0 && <div className="rounded-2xl bg-white border border-slate-200 p-8 text-sm text-slate-500">No accepted mentorship skills yet.</div>}</div>}

              {location.pathname === "/mentor/analytics" && <div className="grid grid-cols-1 md:grid-cols-4 gap-5">{[["Active Mentees", accepted.length],["Pending Requests", pending.length],["Scheduled Sessions", scheduled.length],["Completed Sessions", completed.length]].map(([label,value]) => <div key={String(label)} className="rounded-2xl bg-white border border-slate-200 p-5"><div className="text-sm text-slate-500">{label}</div><div className="text-3xl font-bold text-slate-900 mt-2">{value}</div></div>)}</div>}

              {location.pathname === "/mentor/notifications" && <div className="space-y-3">{pending.map((r) => <button key={r.requestId} onClick={() => go("/mentor/requests")} className="w-full text-left rounded-2xl bg-white border border-amber-100 p-5 hover:border-purple-200"><div className="font-semibold text-slate-900">New mentorship request</div><div className="text-sm text-slate-500 mt-1">{r.menteeName} requested help with {r.skillName}.</div></button>)}{pending.length === 0 && <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-sm text-slate-500">No pending mentor notifications.</div>}</div>}

              {location.pathname === "/mentor/settings" && <div className="rounded-2xl bg-white border border-slate-200 p-6 text-sm text-slate-600">Your mentor workspace is connected to the live mentorship APIs. Account and role settings remain controlled by the authenticated backend account.</div>}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default WorkspaceSection;
