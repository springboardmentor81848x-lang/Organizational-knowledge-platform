import React from "react";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarDays,
  BookOpen,
  Award,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import mentorshipService, { MentorshipRequest, KnowledgeSession } from "@/services/mentorshipService";

const MentorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = React.useState(false);
  const [requests, setRequests] = React.useState<MentorshipRequest[]>([]);
  const [sessions, setSessions] = React.useState<KnowledgeSession[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    Promise.allSettled([mentorshipService.getRequests(), mentorshipService.getSessions()]).then(([r, s]) => {
      if (!mounted) return;
      if (r.status === "fulfilled") setRequests(r.value);
      if (s.status === "fulfilled") setSessions(s.value);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const pendingRequests = requests.filter(r => r.status === "PENDING");
  const activeMentees = new Set(requests.filter(r => r.status === "ACCEPTED").map(r => r.menteeId)).size;
  const upcomingSessions = sessions.filter(s => s.status === "SCHEDULED");
  const completedSessions = sessions.filter(s => s.status === "COMPLETED");

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/mentor/dashboard",
    },
    {
      label: "My Mentees",
      icon: Users,
      path: "/mentor/mentees",
    },
    {
      label: "Mentorship Requests",
      icon: UserCheck,
      path: "/mentor/requests",
    },
    {
      label: "Knowledge Sessions",
      icon: CalendarDays,
      path: "/mentor/sessions",
    },
    {
      label: "Knowledge Sharing",
      icon: BookOpen,
      path: "/mentor/knowledge-sharing",
    },
    {
      label: "Expertise",
      icon: Award,
      path: "/mentor/expertise",
    },
    {
      label: "Mentorship Analytics",
      icon: BarChart3,
      path: "/mentor/analytics",
    },
    {
      label: "Notifications",
      icon: Bell,
      path: "/mentor/notifications",
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/mentor/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ================= SIDEBAR ================= */}

      <aside
        className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >

        {/* Logo */}

        <div className="h-20 px-5 border-b border-slate-200 flex items-center">

          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              O
            </span>
          </div>

          {!collapsed && (
            <div className="ml-3">
              <div className="font-bold text-xl text-slate-900">
                OKGIP
              </div>

              <div className="text-xs text-purple-600 font-medium">
                MENTOR WORKSPACE
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}

        <nav className="flex-1 px-3 py-5 space-y-1">

          {menuItems.map((item) => {
            const Icon = item.icon;

            const active =
              window.location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-purple-50 text-purple-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />

                {!collapsed && (
                  <span className="ml-3">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}

        </nav>

        {/* Collapse */}

        <div className="border-t border-slate-200 p-3">

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-500 hover:text-slate-900"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                Collapse Sidebar
              </>
            )}
          </button>

        </div>
      </aside>

      {/* ================= MAIN ================= */}

      <main className="flex-1 min-w-0">

        {/* Header */}

        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">

          <div>
            <div className="text-sm text-slate-400">
              Workspace
            </div>

            <h1 className="text-xl font-semibold text-slate-900">
              Mentor Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-5">

            <button className="relative text-slate-500 hover:text-slate-900">
              <Bell className="w-5 h-5" />

              <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-600 rounded-full" />
            </button>

            <div className="h-8 w-px bg-slate-200" />

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="font-semibold text-purple-700">
                  M
                </span>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Mentor
                </div>

                <div className="text-xs text-purple-600">
                  Mentor
                </div>
              </div>

            </div>

          </div>
        </header>

        {/* Content */}

        <div className="p-8">

          {/* Welcome */}

          <div className="mb-8">

            <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold">
              MENTOR WORKSPACE
            </div>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Welcome to your Mentor Dashboard
            </h2>

            <p className="mt-2 text-slate-500">
              Guide employees, share expertise and help close organizational skill gaps.
            </p>

          </div>

          {/* ================= STAT CARDS ================= */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Active Mentees
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {loading ? "…" : activeMentees}
                  </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>

              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Pending Requests
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {loading ? "…" : pendingRequests.length}
                  </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-amber-600" />
                </div>

              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Upcoming Sessions
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {loading ? "…" : upcomingSessions.length}
                  </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                </div>

              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Sessions Completed
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {loading ? "…" : completedSessions.length}
                  </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>

              </div>
            </div>

          </div>

          {/* ================= MAIN GRID ================= */}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Requests */}

            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200">

              <div className="p-6 border-b border-slate-200 flex items-center justify-between">

                <div>
                  <h3 className="font-semibold text-lg text-slate-900">
                    Mentorship Requests
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Employees requesting your expertise.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/mentor/requests")}
                  className="text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  View All
                </button>

              </div>

              <div className="p-6">{pendingRequests.length === 0 ? <div className="flex flex-col items-center justify-center py-10 text-center"><div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center"><MessageSquare className="w-6 h-6 text-slate-400" /></div><h4 className="mt-4 font-medium text-slate-900">No pending requests</h4><p className="mt-2 text-sm text-slate-500 max-w-md">New mentorship requests from employees will appear here.</p></div> : <div className="space-y-3">{pendingRequests.slice(0,3).map(r => <div key={r.requestId} className="border rounded-xl p-4 flex justify-between gap-4"><div><strong>{r.menteeName}</strong><p className="text-sm text-slate-500">{r.skillName}</p></div><button onClick={async()=>{await mentorshipService.acceptRequest(r.requestId);setRequests(await mentorshipService.getRequests())}} className="px-3 py-2 rounded-lg bg-purple-600 text-white text-sm">Accept</button></div>)}</div>}</div>

            </div>

            {/* Expertise */}

            <div className="bg-white rounded-2xl border border-slate-200">

              <div className="p-6 border-b border-slate-200">

                <h3 className="font-semibold text-lg text-slate-900">
                  Mentor Expertise
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Skills you can share.
                </p>

              </div>

              <div className="p-6">

                <div className="flex flex-col items-center justify-center py-8 text-center">

                  <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>

                  <h4 className="mt-4 font-medium text-slate-900">
                    Expertise profile
                  </h4>

                  <p className="mt-2 text-sm text-slate-500">
                    Your advanced skills will be shown here.
                  </p>

                  <button
                    onClick={() => navigate("/mentor/expertise")}
                    className="mt-5 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
                  >
                    Manage Expertise
                  </button>

                </div>

              </div>

            </div>

          </div>

          {/* ================= SESSIONS ================= */}

          <div className="mt-6 bg-white rounded-2xl border border-slate-200">

            <div className="p-6 border-b border-slate-200 flex items-center justify-between">

              <div>
                <h3 className="font-semibold text-lg text-slate-900">
                  Upcoming Knowledge Sessions
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Your scheduled mentoring and knowledge-sharing sessions.
                </p>
              </div>

              <button
                onClick={() => navigate("/mentor/sessions")}
                className="text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                View Sessions
              </button>

            </div>

            <div className="p-6">{upcomingSessions.length === 0 ? <div className="flex flex-col items-center justify-center py-8 text-center"><div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center"><Clock className="w-6 h-6 text-slate-400" /></div><h4 className="mt-4 font-medium text-slate-900">No upcoming sessions</h4><p className="mt-2 text-sm text-slate-500">Scheduled mentoring sessions will appear here.</p></div> : <div className="space-y-3">{upcomingSessions.slice(0,4).map(s => <div key={s.sessionId} className="border rounded-xl p-4"><strong>{s.title}</strong><p className="text-sm text-slate-500 mt-1">{s.skillName} · {new Date(s.scheduledAt).toLocaleString()}</p><p className="text-sm mt-1">Mentee: {s.menteeName}</p></div>)}</div>}</div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default MentorDashboard;