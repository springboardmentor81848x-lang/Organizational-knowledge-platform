import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { RadarGapChart } from '../../components/charts/RadarGapChart';
import { SkillTrendChart } from '../../components/charts/SkillTrendChart';
import {
  Award,
  AlertTriangle,
  BookOpen,
  FileCheck,
  Clock,
  ArrowUpRight,
  Sparkles,
  Play,
  Bookmark,
  Calendar,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmployeeDashboard = () => {
  const kpiData = [
    {
      title: 'Skill Readiness',
      value: '84%',
      subtext: '+3.2% vs last month',
      icon: Award,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      badge: 'On Track',
      badgeVariant: 'success',
    },
    {
      title: 'Knowledge Gaps',
      value: '3 Critical',
      subtext: 'Gen AI & K8s Security',
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-900/30',
      badge: 'Urgent Action',
      badgeVariant: 'danger',
    },
    {
      title: 'Courses in Progress',
      value: '4 Active',
      subtext: '2 ending this week',
      icon: BookOpen,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/30',
      badge: 'Active',
      badgeVariant: 'primary',
    },
    {
      title: 'Assessments',
      value: '2 Pending',
      subtext: 'Q3 Benchmark Quiz',
      icon: FileCheck,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      badge: 'Due in 3 days',
      badgeVariant: 'warning',
    },
    {
      title: 'Learning Hours',
      value: '32.5 hrs',
      subtext: 'Target: 40 hrs / month',
      icon: Clock,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      badge: '81% Goal',
      badgeVariant: 'success',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider text-blue-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Skill Intelligence Engine Active</span>
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Hello, Alex Morgan
            </h1>
            <p className="text-xs md:text-sm text-blue-100/90 max-w-xl">
              Target Role: <span className="font-bold text-white">Lead Cloud & GenAI Architect</span>. Your current skill match is 84%. Bridge your critical Generative AI gap with top recommended paths below.
            </p>
          </div>
          <Link
            to="/employee/recommendations"
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 shadow-lg transition shrink-0"
          >
            <span>View AI Recommended Courses</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiData.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                    <Icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <Badge variant={kpi.badgeVariant}>{kpi.badge}</Badge>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {kpi.value}
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">
                  {kpi.title}
                </div>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                {kpi.subtext}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Section: Radar Skill Gap vs Target Benchmark & Skill Trend Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Skill Gap Radar vs Target Role</CardTitle>
              <CardDescription>
                Comparing your current proficiency against Lead Cloud Architect requirements
              </CardDescription>
            </div>
            <Badge variant="neutral">Target Benchmark 5.0</Badge>
          </CardHeader>
          <RadarGapChart />
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Learning Progress & Skill Readiness</CardTitle>
              <CardDescription>
                Trajectory of monthly study hours vs skill readiness score
              </CardDescription>
            </div>
            <Badge variant="success">84% Readiness</Badge>
          </CardHeader>
          <SkillTrendChart />
        </Card>
      </div>

      {/* Recommended Training Quick Panel & Mentorship */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Course Spotlight */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Top AI Training Match</CardTitle>
              <CardDescription>
                AI match score calculated from your recent assessment gaps
              </CardDescription>
            </div>
            <Badge variant="purple">97% Match</Badge>
          </CardHeader>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  AI & Machine Learning
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  Enterprise Generative AI & RAG Systems Architecture
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Skill Gap: <span className="font-semibold text-rose-500">LLM Orchestration & Vector DBs</span> • Instructor: Dr. David Chen
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-400">Duration</span>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">14 Hours</div>
              </div>
            </div>

            <ProgressBar progress={35} showPercentage={true} color="bg-blue-600" />

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-3 text-xs text-slate-500">
                <span>Difficulty: <strong className="text-slate-800 dark:text-slate-200">Advanced</strong></span>
                <span>Enrolled: <strong className="text-slate-800 dark:text-slate-200">1,420</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                  <Bookmark className="w-4 h-4" />
                </button>
                <Link
                  to="/employee/course/rec-101"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Continue Course</span>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* Up Next Mentorship Session */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader>
              <div>
                <CardTitle>Upcoming 1-on-1 Mentorship</CardTitle>
                <CardDescription>Scheduled session with your mentor</CardDescription>
              </div>
              <Users className="w-5 h-5 text-indigo-500" />
            </CardHeader>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Mentor"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Dr. Robert Vance
                  </h4>
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                    Staff Cloud Architect
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Thursday, Aug 6 • 2:00 PM - 2:45 PM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>Topic: Microservices Resilience & Istio Mesh</span>
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/employee/mentorship"
            className="w-full mt-4 py-2 text-center rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Manage Mentorship Sessions
          </Link>
        </Card>
      </div>
    </div>
  );
};
