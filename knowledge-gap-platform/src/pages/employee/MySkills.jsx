import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { mockSkillsInventory } from '../../services/mockData';
import { Search, Plus, Award, AlertCircle } from 'lucide-react';

export const MySkills = () => {
  const [skills, setSkills] = useState(mockSkillsInventory);
  const [search, setSearch] = useState('');

  const filtered = skills.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()));

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'Critical': return 'danger';
      case 'High': return 'warning';
      case 'Medium': return 'primary';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Skills Inventory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track current competency levels vs organizational benchmark expectations.
          </p>
        </div>
        <button className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Request Skill Endorsement</span>
        </button>
      </div>

      {/* Search Input */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills by name or taxonomy category..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Skill Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Current Level</th>
                <th className="p-4">Required Benchmark</th>
                <th className="p-4">Gap Delta</th>
                <th className="p-4">Priority Urgency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((skill) => (
                <tr key={skill.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>{skill.name}</span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{skill.category}</td>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{skill.currentLevel} / 5</td>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{skill.requiredLevel} / 5</td>
                  <td className="p-4">
                    {skill.gap > 0 ? (
                      <span className="font-extrabold text-rose-600 dark:text-rose-400">-{skill.gap} Level</span>
                    ) : (
                      <span className="font-bold text-emerald-600">Optimal Match</span>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge variant={getPriorityVariant(skill.priority)}>
                      {skill.priority}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
