import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Brain, 
  Users, 
  FileText, 
  LogOut, 
  Target, 
  BarChart2, 
  TrendingUp, 
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Award
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine role and title based on current URL path
  const path = location.pathname.toLowerCase();
  let roleTitle = "EMPLOYEE PORTAL";
  let subtitle = "Track your professional evolution, manage skills, and unlock new career pathways.";
  if (path.includes("hr")) {
    roleTitle = "HR DASHBOARD";
    subtitle = "Strategic overview of organizational human capital, competency trends, and learning initiatives.";
  } else if (path.includes("manager")) {
    roleTitle = "MANAGER DASHBOARD";
    subtitle = "Real-time workforce intelligence for Team Engineering. Track proficiency, bridge gaps, and optimize learning impact.";
  } else if (path.includes("admin")) {
    roleTitle = "WORKFORCE INTELLIGENCE";
    subtitle = "Strategic overview of organizational competencies and AI-driven insights.";
  }

  return (
    <div className="min-h-screen bg-[#f3f4f8] dark:bg-[#0d0922] text-slate-900 dark:text-white font-sans antialiased p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Navbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-purple-500/20 p-5 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-wider text-slate-900 dark:text-white">OKIP</span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-[10px] font-bold uppercase">
                  {roleTitle}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 hidden sm:inline">Alex Rivera (Admin)</span>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-600/10 dark:bg-purple-600/20 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs font-semibold hover:bg-purple-600/20 transition-all"
            >
              <LogOut className="w-4 h-4" /> Switch Role / Sign Out
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-purple-500/20 shadow-sm backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +5.4%
              </span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Competency Index</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">84.2%</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-purple-500/20 shadow-sm backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <BarChart2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-rose-500">-2.1%</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Knowledge Gap</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">15.8%</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-purple-500/20 shadow-sm backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-emerald-500">Active</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Workforce Reach</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">1,284</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-purple-500/20 shadow-sm backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-amber-500">AI Enabled</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">System Status</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">Optimal</h3>
            </div>
          </div>
        </div>

        {/* Main Content Sections Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-purple-500/20 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" /> Strategic Analytics & Skill Insights
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You have successfully bypassed the database validation layer and routed straight into the platform. This dashboard view mirrors the layout structure designed for your user role. You can navigate freely between modules, review competence mapping, and test workflow actions.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-1">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">AI Recommendation Engine</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Mapping skill gaps to optimized learning tracks automatically.</p>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 space-y-1">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Compliance & Certifications</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Tracking employee progress and credential validations.</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-purple-500/20 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" /> Upcoming Milestones
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <Award className="w-4 h-4 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Core Competency Assessment</h4>
                  <p className="text-[10px] text-slate-500">Oct 24 • 10:00 AM</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Quarterly Sync & Review</h4>
                  <p className="text-[10px] text-slate-500">Oct 28 • 02:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;


