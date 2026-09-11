import React from 'react';
import { Card, CardHeader, CardTitle } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Layers, Plus, Search } from 'lucide-react';

export const SkillsLibrary = () => {
  const categories = [
    { name: 'Generative AI & LLMs', count: 24, top: 'RAG Architecture & Vector DBs' },
    { name: 'Cloud & Kubernetes', count: 32, top: 'Istio Service Mesh & OPA' },
    { name: 'Frontend Architecture', count: 28, top: 'React 19 Server Components' },
    { name: 'Backend & GraphQL', count: 30, top: 'Schema Federation 2' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Layers className="w-6 h-6 text-emerald-600" />
            <span>Enterprise Skills Taxonomy Library</span>
          </h1>
          <p className="text-xs text-slate-500">
            Catalog of tracked technical capabilities, difficulty levels, and industry benchmarks.
          </p>
        </div>
        <button className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Add Skill Taxonomy</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat, i) => (
          <Card key={i} className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{cat.name}</h3>
            <p className="text-xs text-blue-600 font-semibold">{cat.count} Skills Tracked</p>
            <p className="text-[11px] text-slate-400">Featured: {cat.top}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
