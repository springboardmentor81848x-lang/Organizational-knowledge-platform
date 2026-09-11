import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Modal } from '../../components/common/Modal';
import { mockTeamMembers } from '../../services/mockData';
import { Search, Plus, Eye, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeamMembers = () => {
  const [members, setMembers] = useState(mockTeamMembers);
  const [search, setSearch] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const filtered = members.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Team Members Roster
          </h1>
          <p className="text-xs text-slate-500">
            Monitor individual readiness scores, skill gaps, and assign AI learning paths.
          </p>
        </div>
      </div>

      <Card>
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team member by name or role..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
          />
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Employee</th>
                <th className="p-4">Role Title</th>
                <th className="p-4">Readiness Score</th>
                <th className="p-4">Critical Skill Gaps</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center space-x-3">
                    <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20" />
                    <span>{m.name}</span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{m.role}</td>
                  <td className="p-4 font-extrabold text-blue-600 dark:text-blue-400">{m.readiness}%</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {m.gaps.map((gap, i) => (
                        <Badge key={i} variant="danger" className="text-[10px]">
                          {gap}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={m.status === 'Exceeding' ? 'success' : m.status === 'On Track' ? 'primary' : 'warning'}>
                      {m.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedMember(m);
                        setAssignModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-600 hover:text-white text-[11px] font-bold transition"
                    >
                      Assign Training
                    </button>
                    <Link
                      to={`/manager/employee/${m.id}`}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold transition"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Details</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Assign Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Training Path to ${selectedMember?.name}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Select a target course to assign to {selectedMember?.name} based on their identified skill gaps ({selectedMember?.gaps.join(', ')}).
          </p>
          <div className="space-y-2 text-xs">
            <label className="font-bold text-slate-800 dark:text-slate-200">Recommended Course:</label>
            <select className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold">
              <option>Enterprise Generative AI & RAG Systems Architecture (97% Match)</option>
              <option>Kubernetes Microservices Security & Zero Trust (92% Match)</option>
              <option>GraphQL Federation & API Gateway Scaling (85% Match)</option>
            </select>
          </div>
          <button
            onClick={() => {
              alert(`Training course assigned to ${selectedMember?.name}!`);
              setAssignModalOpen(false);
            }}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
          >
            Dispatch Course Assignment
          </button>
        </div>
      </Modal>
    </div>
  );
};
