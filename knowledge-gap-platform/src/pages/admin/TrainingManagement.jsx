import React from 'react';
import { Card, CardHeader, CardTitle } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { GraduationCap, Plus, BookOpen, Sparkles } from 'lucide-react';

export const TrainingManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <GraduationCap className="w-6 h-6 text-amber-500" />
            <span>Training & Course Catalog Management</span>
          </h1>
          <p className="text-xs text-slate-500">
            Configure automated course assignment rules and integration with corporate learning vendors.
          </p>
        </div>
        <button className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Publish New Course</span>
        </button>
      </div>

      <Card className="space-y-4">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <CardTitle>AI Auto-Assignment Engine Rules</CardTitle>
          </div>
          <Badge variant="success">Active (100% Automated)</Badge>
        </CardHeader>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          When an employee assessment reveals a skill gap delta &gt; 2 levels, the AI engine automatically dispatches high-precision courses directly to their recommended feed.
        </p>
      </Card>
    </div>
  );
};
