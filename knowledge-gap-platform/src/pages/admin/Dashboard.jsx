import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { DepartmentGapBarChart } from '../../components/charts/DepartmentGapBarChart';
import { ReadinessDonut } from '../../components/charts/ReadinessDonut';
import { Building2, Users, Layers, GraduationCap, TrendingUp, ShieldAlert } from 'lucide-react';

export const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
            Enterprise Intelligence Console
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Organizational Knowledge Gap & AI Readiness
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Monitoring 1,240 Employees across 12 Global Business Units • Organization Readiness Index: <span className="font-bold text-emerald-400">86.2%</span>
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            SOC2 Certified AI Engine
          </Badge>
        </div>
      </div>

      {/* Enterprise KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">Total Workforce</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">1,240 Users</div>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-emerald-600 font-bold mt-2">96% Assessment Completed</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">Business Departments</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">12 Active</div>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold mt-2">Top: Cloud Infrastructure</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">Tracked Enterprise Skills</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">184 Taxonomies</div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600">
              <Layers className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-emerald-600 font-bold mt-2">+14 New AI Skills Added</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">Retraining ROI Index</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">4.8x Return</div>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold mt-2">Based on retention & throughput</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Department Skill Readiness Breakdown</CardTitle>
              <CardDescription>Comparing readiness scores across core departments</CardDescription>
            </div>
          </CardHeader>
          <DepartmentGapBarChart />
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Organization Skill Distribution Tier</CardTitle>
              <CardDescription>Workforce percentage by skill maturity level</CardDescription>
            </div>
          </CardHeader>
          <ReadinessDonut />
        </Card>
      </div>
    </div>
  );
};
