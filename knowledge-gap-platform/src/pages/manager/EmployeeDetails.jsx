import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { RadarGapChart } from '../../components/charts/RadarGapChart';
import { mockTeamMembers } from '../../services/mockData';
import { ArrowLeft, User, Mail, Award, BookOpen } from 'lucide-react';

export const EmployeeDetails = () => {
  const { id } = useParams();
  const member = mockTeamMembers.find(m => m.id === id) || mockTeamMembers[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link
        to="/manager/team"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Team Roster</span>
      </Link>

      <Card className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/30" />
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{member.name}</h1>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{member.role}</p>
            <p className="text-xs text-slate-400">Product Engineering Department</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Readiness Score</span>
          <div className="text-3xl font-black text-blue-600">{member.readiness}%</div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Skill Gap Radar</CardTitle>
          </CardHeader>
          <RadarGapChart />
        </Card>

        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Active Skill Gaps & Assigned Courses</CardTitle>
          </CardHeader>

          <div className="space-y-3">
            {member.gaps.map((gap, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                  <span>{gap}</span>
                  <Badge variant="danger">Critical Gap</Badge>
                </div>
                <p className="text-xs text-slate-500">Assigned Training: Enterprise GenAI Architecture</p>
                <ProgressBar progress={40} height="h-1.5" color="bg-blue-600" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
