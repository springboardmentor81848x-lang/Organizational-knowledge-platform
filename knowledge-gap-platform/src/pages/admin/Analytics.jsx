import React from 'react';
import { Card, CardHeader, CardTitle } from '../../components/common/Card';
import { SkillTrendChart } from '../../components/charts/SkillTrendChart';
import { ReadinessDonut } from '../../components/charts/ReadinessDonut';
import { DepartmentGapBarChart } from '../../components/charts/DepartmentGapBarChart';
import { BarChart3, Sparkles } from 'lucide-react';

export const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <span>Predictive AI Analytics Console</span>
        </h1>
        <p className="text-xs text-slate-500">
          Advanced predictive modeling on upcoming skill shortages and retraining performance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Skill Velocity & Readiness Forecast</CardTitle>
          </CardHeader>
          <SkillTrendChart />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workforce Skill Distribution Spectrum</CardTitle>
          </CardHeader>
          <ReadinessDonut />
        </Card>
      </div>
    </div>
  );
};
