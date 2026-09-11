import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { CheckCircle2, AlertTriangle, ArrowRight, Award, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AssessmentResults = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Score Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <Badge variant="success" className="bg-white/20 text-white border-none">
            Assessment Completed
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Overall Benchmark Score: 84 / 100
          </h1>
          <p className="text-xs text-emerald-100 max-w-md">
            You scored in the top 15th percentile for Frontend Architecture & React 19. Identified 2 critical gaps in Generative AI RAG & K8s Security.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-md text-center shrink-0 border border-white/20">
          <div className="text-3xl font-black">A- Grade</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">Readiness Tier</div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <CardTitle>Top Verified Strengths</CardTitle>
            </div>
          </CardHeader>
          <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-center space-x-2 p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-bold">React 19 Compiler & Server Actions (98%)</span>
            </li>
            <li className="flex items-center space-x-2 p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-bold">TypeScript System Design (92%)</span>
            </li>
            <li className="flex items-center space-x-2 p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-bold">GraphQL Federation Schemas (88%)</span>
            </li>
          </ul>
        </Card>

        <Card className="space-y-4">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <CardTitle>Identified Knowledge Gaps</CardTitle>
            </div>
          </CardHeader>
          <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-900/20">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="font-bold">Generative AI RAG Systems</span>
              </div>
              <Badge variant="danger">High Severity</Badge>
            </li>
            <li className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-900/20">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="font-bold">Kubernetes RBAC Security</span>
              </div>
              <Badge variant="warning">Medium Severity</Badge>
            </li>
          </ul>
        </Card>
      </div>

      {/* Next Step Action */}
      <Card className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 border-blue-200 dark:border-blue-900/40">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>AI Retraining Plan Ready</span>
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Auto-generated learning paths tailored to close your 2 identified knowledge gaps in 14 days.
          </p>
        </div>
        <Link
          to="/employee/recommendations"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition shrink-0"
        >
          <span>Launch AI Recommendations</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Card>
    </div>
  );
};
