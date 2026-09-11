import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { DepartmentGapBarChart } from '../../components/charts/DepartmentGapBarChart';
import { Users, AlertTriangle, CheckCircle, TrendingUp, UserCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ManagerDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">
            Manager Intelligence Suite
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Product Engineering Team Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Managing 14 Direct Reports • Team Skill Readiness Index: <span className="font-bold text-emerald-400">81.4%</span>
          </p>
        </div>
        <Link
          to="/manager/team-gaps"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg transition shrink-0"
        >
          <span>Analyze Team Skill Gaps</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">Team Readiness Index</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">81.4%</div>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-emerald-600 font-bold mt-2">+2.8% since last quarter</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">High Risk Skill Gaps</span>
              <div className="text-2xl font-black text-rose-600 mt-1">4 Team Members</div>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-900/30 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-rose-500 font-bold mt-2">Gen AI & Container Security</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">Active Retraining Paths</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">12 Assigned</div>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold mt-2">85% Completion Rate</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">Training Budget Used</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">$18,400</div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold mt-2">61% of Annual Budget</p>
        </Card>
      </div>

      {/* Team Readiness vs Gap Chart */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Cross-Department Readiness & Gap Severity</CardTitle>
            <CardDescription>Comparative team readiness scores across organizational units</CardDescription>
          </div>
        </CardHeader>
        <DepartmentGapBarChart />
      </Card>
    </div>
  );
};
