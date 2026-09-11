import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import { mockUsers } from '../../services/mockData';
import { Search, Plus, UserCheck, Trash2, Edit3 } from 'lucide-react';

export const UsersManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Employee', department: 'Product Engineering' });

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const handleAddUser = (e) => {
    e.preventDefault();
    setUsers(prev => [
      ...prev,
      { id: `u-${Date.now()}`, ...newUser, status: 'Active' }
    ]);
    setAddUserModalOpen(false);
    setNewUser({ name: '', email: '', role: 'Employee', department: 'Product Engineering' });
  };

  const handleDeleteUser = (id) => {
    if (confirm("Are you sure you want to remove this user?")) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            User Management Directory
          </h1>
          <p className="text-xs text-slate-500">
            Manage enterprise accounts, roles, access permissions, and organizational departments.
          </p>
        </div>
        <button
          onClick={() => setAddUserModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      <Card>
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email or department..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition"
          />
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">User Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Role</th>
                <th className="p-4">Department</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                  <td className="p-4">
                    <Badge variant={u.role === 'Admin' ? 'purple' : u.role === 'Manager' ? 'primary' : 'neutral'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{u.department}</td>
                  <td className="p-4">
                    <Badge variant={u.status === 'Active' ? 'success' : 'danger'}>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={3} onPageChange={(p) => setCurrentPage(p)} />
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
        title="Provision New Enterprise User"
      >
        <form onSubmit={handleAddUser} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Full Name</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
              placeholder="e.g. Jordan Miller"
              className="w-full p-2.5 mt-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Work Email</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
              placeholder="jordan.m@enterprise.ai"
              className="w-full p-2.5 mt-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Role</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full p-2.5 mt-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Department</label>
              <select
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                className="w-full p-2.5 mt-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Product Engineering">Product Engineering</option>
                <option value="Data & AI Innovations">Data & AI Innovations</option>
                <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                <option value="UX & Product Design">UX & Product Design</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition mt-2"
          >
            Create User Account
          </button>
        </form>
      </Modal>
    </div>
  );
};
