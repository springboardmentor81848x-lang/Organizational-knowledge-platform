import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, UserCheck, CalendarDays, BookOpen, Award, BarChart3, Bell, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const items = [
  ["Dashboard", "/mentor/dashboard", LayoutDashboard],
  ["My Mentees", "/mentor/mentees", Users],
  ["Mentorship Requests", "/mentor/requests", UserCheck],
  ["Knowledge Sessions", "/mentor/sessions", CalendarDays],
  ["Knowledge Sharing", "/mentor/knowledge-sharing", BookOpen],
  ["Expertise", "/mentor/expertise", Award],
  ["Mentorship Analytics", "/mentor/analytics", BarChart3],
  ["Notifications", "/mentor/notifications", Bell],
  ["Settings", "/mentor/settings", Settings],
] as const;

export default function MentorLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  return <div className="min-h-screen bg-slate-50 flex">
    <aside className={`${collapsed ? "w-20" : "w-64"} bg-white border-r border-slate-200 flex flex-col transition-all`}>
      <div className="h-20 px-5 border-b border-slate-200 flex items-center">
        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">O</div>
        {!collapsed && <div className="ml-3"><div className="font-bold text-xl text-slate-900">OKGIP</div><div className="text-xs text-purple-600 font-medium">MENTOR WORKSPACE</div></div>}
      </div>
      <nav className="flex-1 px-3 py-5 space-y-1">
        {items.map(([label, path, Icon]) => <NavLink key={path} to={path} end={path === "/mentor/dashboard"} className={({isActive}) => `w-full flex items-center rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
          <Icon className="w-5 h-5 flex-shrink-0" />{!collapsed && <span className="ml-3">{label}</span>}
        </NavLink>)}
      </nav>
      <div className="border-t border-slate-200 p-3 space-y-1">
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-600 hover:bg-slate-50"><LogOut className="w-5 h-5" />{!collapsed && "Logout"}</button>
        <button onClick={() => setCollapsed(v => !v)} className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-500">{collapsed ? <ChevronRight className="w-5 h-5"/> : <><ChevronLeft className="w-5 h-5"/>Collapse Sidebar</>}</button>
      </div>
    </aside>
    <main className="flex-1 min-w-0">
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8"><div><div className="text-sm text-slate-400">Mentor Workspace</div><h1 className="text-xl font-semibold text-slate-900">{title}</h1></div><button onClick={() => navigate("/mentor/notifications")} className="text-slate-500"><Bell className="w-5 h-5"/></button></header>
      <div className="p-8">{children}</div>
    </main>
  </div>;
}
