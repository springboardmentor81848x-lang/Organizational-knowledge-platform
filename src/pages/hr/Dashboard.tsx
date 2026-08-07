import React from "react";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase, 
  Award, 
  TrendingUp, 
  Brain, 
  GraduationCap, 
  ClipboardCheck, 
  BarChart3, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Moon, 
  Plus, 
  Calendar, 
  FileText, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  UserPlus,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck
} from "lucide-react";

export const HRDashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-[#f8f9fc] font-sans antialiased text-slate-800 overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-wider text-slate-900 block leading-none">OKIP</span>
              <p className="text-[8px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">Intelligence Platform</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-purple-50 text-purple-700 font-bold">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
              <Users className="w-4 h-4" /> Employees
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
              <Building2 className="w-4 h-4" /> Departments
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
              <Briefcase className="w-4 h-4" /> Job Roles
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
              <Award className="w-4 h-4" /> Skills
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
              <BarChart3 className="w-4 h-4" /> Competency Framework
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
              <TrendingUp className="w-4 h-4" /> Knowledge Gap Analysis
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
              <Brain className="w-4 h-4" /> AI Recommendations
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
              <GraduationCap className="w-4 h-4" /> Training Management
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
              <ClipboardCheck className="w-4 h-4" /> Assessments
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
              <FileText className="w-4 h-4" /> Reports & Analytics
            </a>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-1 text-xs font-semibold pt-4 border-t border-slate-100">
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100">
            <Settings className="w-4 h-4" /> Settings
          </a>
          <a href="/login" className="flex items-center gap-3 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50">
            <LogOut className="w-4 h-4" /> Logout
          </a>
        </div>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">Overview</span>
          </div>

          {/* Search & Profile */}
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search insights, employees..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-100/70 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>

            <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 bg-purple-600 rounded-full absolute top-1.5 right-1.5" />
            </button>
            <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100">
              <Moon className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="User Avatar"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-500/20"
              />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 leading-none">Alex Rivera</p>
                <p className="text-[10px] font-semibold text-slate-400 leading-tight">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* DASHBOARD SCROLLABLE BODY */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* Header Banner */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-bold text-[10px] uppercase">EXECUTIVE DASHBOARD</span>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> All Engine Online
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">HR Dashboard</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Strategic overview of organizational human capital, competency trends, and learning initiatives.
              </p>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50">
                <Plus className="w-3.5 h-3.5" /> Assign Training
              </button>
              <button className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50">
                <Calendar className="w-3.5 h-3.5" /> Schedule Assessment
              </button>
              <button className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50">
                <FileText className="w-3.5 h-3.5" /> Generate HR Report
              </button>
              <button className="px-3 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-purple-500/20 hover:bg-purple-700">
                <Download className="w-3.5 h-3.5" /> Export Dashboard
              </button>
            </div>
          </div>

          {/* 6 Key Performance Metric Cards */}
          <div className="grid grid-cols-6 gap-4">
            {/* 1. Total Employees */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3" /> 8.2%
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">TOTAL EMPLOYEES</p>
                <p className="text-xl font-black text-slate-900">1,284</p>
              </div>
            </div>

            {/* 2. Employees in Training */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3" /> 12.4%
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">EMPLOYEES IN TRAINING</p>
                <p className="text-xl font-black text-slate-900">312</p>
              </div>
            </div>

            {/* 3. Pending Assessments */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-bold text-rose-500 flex items-center">
                  <ArrowDownRight className="w-3 h-3" /> 3.6%
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">PENDING ASSESSMENTS</p>
                <p className="text-xl font-black text-slate-900">48</p>
              </div>
            </div>

            {/* 4. Certification Completion */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3" /> 2.2%
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">CERTIFICATION COMPLETION</p>
                <p className="text-xl font-black text-slate-900">92.4%</p>
              </div>
            </div>

            {/* 5. Avg Competency Score */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <Brain className="w-4 h-4 text-purple-600" />
                <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3" /> 1.8%
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">AVG COMPETENCY SCORE</p>
                <p className="text-xl font-black text-slate-900">78.2</p>
              </div>
            </div>

            {/* 6. Knowledge Gap Index */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <TrendingUp className="w-4 h-4 text-rose-500" />
                <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                  <ArrowDownRight className="w-3 h-3" /> 0.4%
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">KNOWLEDGE GAP INDEX</p>
                <p className="text-xl font-black text-slate-900">14.2%</p>
              </div>
            </div>
          </div>

          {/* Main Content Grid: Dept Distribution + Workforce Overview + AI Workforce Intelligence */}
          <div className="grid grid-cols-12 gap-6">
            
            {/* Employee Distribution Donut */}
            <div className="col-span-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900">Employee Distribution by Dept</h3>
              <div className="flex items-center justify-center py-4">
                <div className="w-36 h-36 rounded-full border-[12px] border-purple-600 border-t-indigo-500 border-r-emerald-400 border-b-amber-400 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-600">5 Depts</span>
                </div>
              </div>
            </div>

            {/* Workforce Overview */}
            <div className="col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900">Workforce Overview</h3>
              <div className="space-y-3 divide-y divide-slate-100 text-xs">
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="font-bold text-slate-800">New Joiners (MTD)</p>
                    <p className="text-[10px] text-slate-400">STATUS: GROUP</p>
                  </div>
                  <span className="text-base font-black text-slate-900">24</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="font-bold text-slate-800">Probation Period</p>
                    <p className="text-[10px] text-slate-400">STATUS: GROUP</p>
                  </div>
                  <span className="text-base font-black text-slate-900">42</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="font-bold text-slate-800">Active / Stable</p>
                    <p className="text-[10px] text-slate-400">STATUS: GROUP</p>
                  </div>
                  <span className="text-base font-black text-slate-900">1042</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="font-bold text-slate-800">High Performance</p>
                    <p className="text-[10px] text-slate-400">STATUS: GROUP</p>
                  </div>
                  <span className="text-base font-black text-slate-900">118</span>
                </div>
              </div>
            </div>

            {/* AI Workforce Intelligence Card */}
            <div className="col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 p-5 rounded-2xl text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold">AI Workforce Intelligence</h3>
                </div>
                <span className="text-[10px] text-purple-300 font-medium">Real-time HR analytics</span>
              </div>

              <div className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-2">
                <span className="text-[9px] font-bold text-purple-300 uppercase">RECOMMENDATION</span>
                <p className="text-xs font-bold">Cloud Upskilling Required</p>
                <p className="text-[10px] text-slate-300">AI identified a 15% skill gap in Serverless Arch for Engineering Team B.</p>
              </div>

              <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                Open Recommendation Center <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Pending HR Approvals Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Pending HR Approvals</h3>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">12 TOTAL PENDING</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase">
                  <th className="pb-2">REFERENCE</th>
                  <th className="pb-2">REQUESTED BY</th>
                  <th className="pb-2">ACTION TYPE</th>
                  <th className="pb-2">TIME ELAPSED</th>
                  <th className="pb-2">PRIORITY</th>
                  <th className="pb-2 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3 font-bold text-slate-900">APP-001</td>
                  <td className="py-3">Sarah Chen</td>
                  <td className="py-3">AWS Certification Reimbursement</td>
                  <td className="py-3 text-slate-400">2h ago</td>
                  <td className="py-3"><span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">HIGH PRIORITY</span></td>
                  <td className="py-3 text-right">
                    <button className="p-1 rounded bg-emerald-50 text-emerald-600 mr-1"><CheckCircle2 className="w-4 h-4" /></button>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-slate-900">APP-002</td>
                  <td className="py-3">Marcus Thorne</td>
                  <td className="py-3">Leadership Training Enrollment</td>
                  <td className="py-3 text-slate-400">5h ago</td>
                  <td className="py-3"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">STANDARD</span></td>
                  <td className="py-3 text-right">
                    <button className="p-1 rounded bg-emerald-50 text-emerald-600 mr-1"><CheckCircle2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </main>
      </div>
    </div>
  );
};

export default HRDashboard;