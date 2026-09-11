import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { mockDepartments } from '../../services/mockData';
import { Building2, Users, Award, AlertTriangle } from 'lucide-react';

export const Departments = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
          <Building2 className="w-6 h-6 text-purple-600" />
          <span>Departments Overview</span>
        </h1>
        <p className="text-xs text-slate-500">
          Track readiness scores, workforce headcount, and critical gaps by organizational business unit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockDepartments.map((dept) => (
          <Card key={dept.id} className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{dept.name}</h3>
                <p className="text-xs text-slate-400">{dept.membersCount} Active Members</p>
              </div>
              <Badge variant={dept.readiness >= 90 ? 'success' : 'primary'}>
                {dept.readiness}% Readiness
              </Badge>
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Top Mastery Skill:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{dept.topSkill}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Critical Gap:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{dept.criticalGap}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
