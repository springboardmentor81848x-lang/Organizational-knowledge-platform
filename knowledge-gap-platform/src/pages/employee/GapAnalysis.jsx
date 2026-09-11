import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { RadarGapChart } from '../../components/charts/RadarGapChart';
import { BrainCircuit, ArrowRight, Target, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const GapAnalysis = () => {
  const [targetRole, setTargetRole] = useState('Lead Cloud & GenAI Architect');

  const gapItems = [
    { skill: 'Generative AI & RAG Engineering', current: 2, required: 5, gapDelta: 3, urgency: 'Critical', course: 'Enterprise GenAI & RAG Systems' },
    { skill: 'Kubernetes Microservices Security', current: 3, required: 5, gapDelta: 2, urgency: 'High', course: 'K8s Microservices Security & Zero Trust' },
    { skill: 'System Design & Zero Trust Security', current: 3, required: 4, gapDelta: 1, urgency: 'Medium', course: 'GraphQL & API Gateway Scaling' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <BrainCircuit className="w-6 h-6 text-blue-600" />
            <span>Knowledge Gap Analysis</span>
          </h1>
          <p className="text-xs text-slate-500">
            Compare your competency footprint against target role benchmarks to pinpoint training priorities.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Target Role:</label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
          >
            <option value="Lead Cloud & GenAI Architect">Lead Cloud & GenAI Architect</option>
            <option value="Principal Frontend Engineer">Principal Frontend Engineer</option>
            <option value="Engineering Manager">Engineering Manager</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Skill Gap Footprint Radar</CardTitle>
              <CardDescription>Visual overlap between current skill levels vs target position</CardDescription>
            </div>
            <Badge variant="primary">Target: {targetRole}</Badge>
          </CardHeader>
          <RadarGapChart />
        </Card>

        <Card className="space-y-4">
          <CardHeader>
            <div>
              <CardTitle>Critical Gap Urgency Matrix</CardTitle>
              <CardDescription>Skill shortages requiring immediate remediation</CardDescription>
            </div>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </CardHeader>

          <div className="space-y-3">
            {gapItems.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.skill}</h4>
                  <Badge variant={item.urgency === 'Critical' ? 'danger' : 'warning'}>
                    -{item.gapDelta} Level Gap ({item.urgency})
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Current: {item.current}/5</span>
                  <span>Required: {item.required}/5</span>
                </div>
                <ProgressBar progress={(item.current / item.required) * 100} height="h-1.5" color="bg-rose-500" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
