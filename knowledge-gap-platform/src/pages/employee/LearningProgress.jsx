import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { SkillTrendChart } from '../../components/charts/SkillTrendChart';
import { Award, Clock, BookOpen, CheckCircle, TrendingUp } from 'lucide-react';

export const LearningProgress = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Learning Progress & Analytics
        </h1>
        <p className="text-xs text-slate-500">
          Track completed modules, study hours logged, and certification milestone achievements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">32.5 hrs</div>
            <div className="text-xs font-bold text-slate-500">Study Hours This Month</div>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">14 Courses</div>
            <div className="text-xs font-bold text-slate-500">Completed Courses</div>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">6 Verified</div>
            <div className="text-xs font-bold text-slate-500">Skill Badges Earned</div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Learning Trajectory</CardTitle>
          <CardDescription>Visualizing continuous upskilling velocity</CardDescription>
        </CardHeader>
        <SkillTrendChart />
      </Card>
    </div>
  );
};
