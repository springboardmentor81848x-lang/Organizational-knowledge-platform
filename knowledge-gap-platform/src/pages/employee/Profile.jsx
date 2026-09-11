import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Building, Briefcase, Award, ShieldCheck, MapPin, Calendar, Edit3 } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Profile Banner */}
      <Card className="relative overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 rounded-t-xl -m-6 mb-0" />
        <div className="relative pt-0 flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 px-2">
          <div className="flex items-end space-x-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl"
            />
            <div className="pb-1">
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                {user.name}
              </h1>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {user.jobTitle} • {user.department}
              </p>
            </div>
          </div>
          <button className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition self-start sm:self-auto">
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </Card>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
          </CardHeader>
          <div className="space-y-3 text-xs">
            <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{user.department}</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
              <User className="w-4 h-4 text-slate-400" />
              <span>Manager: {user.manager}</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>San Francisco HQ (Hybrid)</span>
            </div>
          </div>
        </Card>

        <Card className="space-y-4 md:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Target Role Readiness Score</CardTitle>
              <CardDescription>Target Goal: Lead Cloud & GenAI Architect</CardDescription>
            </div>
            <Badge variant="success">84% Readiness</Badge>
          </CardHeader>

          <ProgressBar progress={84} showPercentage={true} color="bg-blue-600" height="h-3" />

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
              <div className="text-xl font-bold text-blue-600">{user.coursesCompleted}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Courses Completed</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
              <div className="text-xl font-bold text-emerald-600">{user.learningHoursThisMonth}h</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Study Hours</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
              <div className="text-xl font-bold text-purple-600">6 Verified</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Certifications</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
