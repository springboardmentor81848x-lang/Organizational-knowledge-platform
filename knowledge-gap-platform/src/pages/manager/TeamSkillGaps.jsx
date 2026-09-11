import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { RadarGapChart } from '../../components/charts/RadarGapChart';
import { AlertTriangle, BrainCircuit, ShieldAlert } from 'lucide-react';

export const TeamSkillGaps = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
          <BrainCircuit className="w-6 h-6 text-rose-600" />
          <span>Team Skill Gaps Heatmap</span>
        </h1>
        <p className="text-xs text-slate-500">
          Identify team-wide skill vulnerabilities and plan targeted team retraining cohorts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Team Competency Footprint</CardTitle>
              <CardDescription>Aggregate skill proficiency across all direct reports</CardDescription>
            </div>
            <Badge variant="danger font-extrabold">3 Critical Gaps</Badge>
          </CardHeader>
          <RadarGapChart />
        </Card>

        <Card className="space-y-4">
          <CardHeader>
            <div>
              <CardTitle>Top Team Shortages requiring Action</CardTitle>
              <CardDescription>Ranked by business operational risk impact</CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900 dark:text-rose-200">1. Generative AI / RAG Implementation</span>
                <Badge variant="danger">5 Employees Affected</Badge>
              </div>
              <p className="text-rose-700 dark:text-rose-300">
                Risk: Delays in launching Q4 AI assistant feature. Mandatory retraining recommended.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 dark:text-amber-200">2. Kubernetes Microservices Security</span>
                <Badge variant="warning">3 Employees Affected</Badge>
              </div>
              <p className="text-amber-700 dark:text-amber-300">
                Risk: Compliance audit gap in container RBAC policies.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
