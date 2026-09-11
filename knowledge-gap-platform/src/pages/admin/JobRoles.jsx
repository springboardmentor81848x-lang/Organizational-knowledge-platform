import React from 'react';
import { Card, CardHeader, CardTitle } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { mockJobRoles } from '../../services/mockData';
import { Briefcase, Layers, Plus } from 'lucide-react';

export const JobRoles = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            <span>Job Roles & Competency Framework</span>
          </h1>
          <p className="text-xs text-slate-500">
            Define required benchmark skills and competency levels per job tier across the enterprise.
          </p>
        </div>
        <button className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Create New Role Matrix</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockJobRoles.map((role) => (
          <Card key={role.id} className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{role.title}</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{role.department}</p>
              </div>
              <Badge variant="primary">Benchmark: {role.benchmarkScore}%</Badge>
            </div>
            <p className="text-xs text-slate-500">
              Requires {role.requiredSkillCount} verified competencies including Systems Architecture, Cloud Security, and Gen AI Integration.
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};
