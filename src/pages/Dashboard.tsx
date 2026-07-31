import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  Award,
  AlertTriangle,
  GraduationCap,
  TrendingDown,
  BrainCircuit,
  ArrowRight,
  PlusCircle,
  BarChart2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { AnalyticsData, KnowledgeGap } from '../types';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentGaps, setRecentGaps] = useState<KnowledgeGap[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, gapsRes] = await Promise.all([
        api.get('/gaps/analytics'),
        api.get('/gaps?priority=High'),
      ]);

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      }
      if (gapsRes.data.success) {
        setRecentGaps(gapsRes.data.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Error loading dashboard analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-bold">Computing Organizational Gap Intelligence...</p>
        </div>
      </div>
    );
  }

  const m = analytics?.metrics;

  return (
    <div className="space-y-6 text-xs">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-950 border border-emerald-800 rounded-3xl p-6 shadow-xl text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold mb-2 text-[11px]">
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-300" />
              <span>Real-Time Competency & Gap Engine</span>
            </div>
            <h1 className="text-xl font-extrabold tracking-wide">
              Welcome back, {user?.employee ? `${user.employee.first_name} ${user.employee.last_name}` : 'Administrator'}
            </h1>
            <p className="text-slate-200 text-xs mt-1 max-w-2xl leading-relaxed">
              OKGIP intelligence algorithms have identified{' '}
              <span className="text-amber-300 font-extrabold">{m?.highPriorityGaps || 0} critical skill gaps</span> across{' '}
              {m?.totalDepartments || 0} departments. Targeted training programs are underway to restore baseline proficiency.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/gaps')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Analyze All Gaps</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Employees</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{m?.totalEmployees}</p>
          <p className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-0.5">
            <span>Active Workforce</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Departments</span>
            <Building2 className="w-4 h-4 text-violet-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{m?.totalDepartments}</p>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">Operational Units</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Skills Monitored</span>
            <Award className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{m?.totalSkills}</p>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">Competency Catalog</p>
        </div>

        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">High Priority</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-900">{m?.highPriorityGaps}</p>
          <p className="text-[10px] text-amber-700 font-bold mt-1">Deficit ≥ 2 levels</p>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Training</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-950">{m?.inTrainingCount}</p>
          <p className="text-[10px] text-emerald-700 font-bold mt-1">Upskilling Active</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Gap Score</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{m?.avgGapScore}</p>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">Target Deficit</p>
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Gap Breakdown */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                Department Knowledge Gap Distribution
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Total gaps & high-priority flags per department</p>
            </div>
            <button
              onClick={() => navigate('/departments')}
              className="text-[11px] text-emerald-700 font-bold hover:underline"
            >
              View Depts
            </button>
          </div>

          <div className="space-y-3.5 pt-2">
            {analytics?.departmentBreakdown.map((dept) => {
              const total = analytics.metrics.totalGaps || 1;
              const barWidth = Math.min(100, Math.round((dept.total_gaps / total) * 100 * 2.5));

              return (
                <div key={dept.department_id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{dept.department_name}</span>
                    <span className="text-slate-500 text-[11px] font-medium">
                      <strong className="text-slate-900">{dept.total_gaps}</strong> total gaps (
                      <span className="text-amber-600 font-bold">{dept.high_gaps} high</span>)
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/50">
                    <div
                      className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-500 shadow-xs"
                      style={{ width: `${Math.max(8, barWidth)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skill Deficiencies Ranking */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-violet-600" />
              Skill Deficiencies Ranking
            </h2>
            <button
              onClick={() => navigate('/skills')}
              className="text-[11px] text-emerald-700 font-bold hover:underline"
            >
              Skills Catalog
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {analytics?.skillDeficiencies.slice(0, 5).map((sk) => (
              <div
                key={sk.skill_id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-slate-900">{sk.skill_name}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{sk.category}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-200">
                    {sk.gap_count} gaps
                  </span>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Avg Deficit: -{sk.avg_deficit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Gap Timeline & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Gap Timeline */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              High Priority Knowledge Gap Alerts
            </h2>
            <button
              onClick={() => navigate('/gaps')}
              className="text-[11px] text-emerald-700 font-bold hover:underline"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentGaps.length === 0 ? (
              <p className="p-4 text-slate-500 text-center font-medium">No critical gaps detected.</p>
            ) : (
              recentGaps.map((gap) => (
                <div key={gap.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center font-black text-xs shrink-0">
                      -{gap.gap_score}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {gap.employee_name} <span className="text-slate-500 font-normal">({gap.department_name})</span>
                      </p>
                      <p className="text-[11px] text-emerald-700 font-bold">{gap.skill_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      Req: {gap.required_proficiency} | Curr: {gap.current_proficiency}
                    </span>
                    <button
                      onClick={() => navigate(`/training`)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Assign Training
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Operations Panel */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-4 h-4 text-violet-600" />
            Quick Management Actions
          </h2>

          <div className="space-y-2.5">
            <button
              onClick={() => navigate('/employees')}
              className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-800 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">Add New Employee</span>
              </div>
              <PlusCircle className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </button>

            <button
              onClick={() => navigate('/skills')}
              className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-800 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-violet-600" />
                <span className="font-bold">Assess Skill Proficiency</span>
              </div>
              <PlusCircle className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition-colors" />
            </button>

            <button
              onClick={() => navigate('/training')}
              className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-800 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-teal-600" />
                <span className="font-bold">Create Training Program</span>
              </div>
              <PlusCircle className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-800 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                <span className="font-bold">Export PDF/Excel Reports</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
