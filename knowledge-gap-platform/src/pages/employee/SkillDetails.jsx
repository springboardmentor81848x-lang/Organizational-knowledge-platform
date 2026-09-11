import React from 'react';
import { Card, CardHeader, CardTitle } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Award, Sparkles, BookOpen, Target, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SkillDetails = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Skills</span>
      </button>

      {/* Header Banner */}
      <Card className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="info" className="bg-white/20 text-white border-none">
                Artificial Intelligence
              </Badge>
              <span className="text-xs text-blue-200 font-semibold">• High Priority Skill</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Generative AI & RAG Architecture
            </h1>
            <p className="text-xs text-blue-100 max-w-xl">
              Retrieval-Augmented Generation, vector index optimization, embedding models, and LLM orchestration.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center shrink-0">
            <span className="text-xs font-bold text-blue-100 uppercase tracking-wider block">Proficiency Level</span>
            <span className="text-3xl font-black">Level 4.0</span>
            <span className="text-[10px] text-emerald-300 font-bold block mt-1">Target Benchmark: 5.0</span>
          </div>
        </div>
      </Card>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Competency Breakdown & Benchmark Gap</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Current Mastery (80%)</span>
                  <span className="text-blue-600">Level 4 / 5</span>
                </div>
                <ProgressBar progress={80} color="blue" />
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Target Role Benchmark (100%)</span>
                  <span className="text-emerald-600">Level 5 / 5</span>
                </div>
                <ProgressBar progress={100} color="emerald" />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Identified Sub-competency Gaps
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 flex items-start space-x-2 text-rose-800 dark:text-rose-300 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>Vector Indexing Performance Tuning</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-start space-x-2 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                  <span>LLM Guardrails & Hallucination Mitigation</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Recommended Actions */}
          <Card>
            <CardHeader>
              <CardTitle>AI Recommended Learning Path</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-blue-600 text-white">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Enterprise Generative AI & RAG Systems Architecture
                    </h5>
                    <p className="text-[11px] text-slate-500">14 Hours • 98% AI Match Score</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/employee/course/rec-101')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                >
                  Enroll
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skill Metadata</CardTitle>
            </CardHeader>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold">Demand Growth</span>
                <span className="font-extrabold text-emerald-600">+42% YoY</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold">Target Roles</span>
                <span className="font-extrabold text-slate-900 dark:text-slate-100">18 Roles</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400 font-semibold">Last Assessed</span>
                <span className="font-extrabold text-slate-900 dark:text-slate-100">July 28, 2026</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
