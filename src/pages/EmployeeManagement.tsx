import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail,
  UserCheck,
  Award
} from 'lucide-react';
import api from '../services/api';
import { Employee, Department } from '../types';
import { Modal } from '../components/Modal';
import { Toast, ToastMessage } from '../components/Toast';
import { PageHeader } from '../components/ui/PageHeader';
import { BotanicalShapes } from '../components/ui/BotanicalShapes';

export const EmployeeManagement: React.FC = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Toast messages
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add/Edit Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    designation: '',
    departmentId: '1',
    status: 'Active',
  });

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, deptRes] = await Promise.all([
        api.get('/employees'),
        api.get('/departments'),
      ]);

      if (empRes.data.success) {
        setEmployees(empRes.data.data);
      }
      if (deptRes.data.success) {
        setDepartments(deptRes.data.data);
      }
    } catch (err) {
      addToast('error', 'Failed to load employee records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/employees', formData);
      if (res.data.success) {
        addToast('success', 'Employee Created', `${formData.firstName} ${formData.lastName} was added.`);
        setIsAddModalOpen(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          designation: '',
          departmentId: '1',
          status: 'Active',
        });
        fetchData();
      }
    } catch (err: any) {
      addToast('error', 'Failed to create employee', err.response?.data?.message || 'Error occurred');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      const res = await api.put(`/employees/${selectedEmployee.id}`, formData);
      if (res.data.success) {
        addToast('success', 'Employee Updated', `${formData.firstName} ${formData.lastName} updated successfully.`);
        setIsEditModalOpen(false);
        setSelectedEmployee(null);
        fetchData();
      }
    } catch (err: any) {
      addToast('error', 'Update Failed', err.response?.data?.message || 'Error occurred');
    }
  };

  const openEditModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setFormData({
      firstName: emp.first_name,
      lastName: emp.last_name,
      email: emp.email,
      phone: emp.phone || '',
      designation: emp.designation,
      departmentId: String(emp.department_id),
      status: emp.status,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this employee?')) return;

    try {
      const res = await api.delete(`/employees/${id}`);
      if (res.data.success) {
        addToast('success', 'Employee Removed');
        fetchData();
      }
    } catch (err) {
      addToast('error', 'Deletion Failed');
    }
  };

  // Filtered employees list
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment = !selectedDepartment || String(emp.department_id) === selectedDepartment;
    const matchesStatus = !selectedStatus || emp.status === selectedStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <div className="space-y-6 text-xs font-sans">
      <Toast toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* Header Section */}
      <PageHeader
        title="Employee Management Directory"
        description="Manage personnel records, department assignments, and competency profiles across your organization."
        badge="Workforce Registry"
        icon={Users}
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#0A7A74] hover:bg-[#086963] text-white font-extrabold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 transition-all shrink-0 cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        }
      />

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-2xs relative overflow-hidden">
        <BotanicalShapes variant="card-corner" opacity={0.2} />
        
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee by name, email, designation..."
            className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0A7A74] font-medium"
          />
        </div>

        <div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0A7A74] font-medium"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0A7A74] font-medium"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium">Loading directory...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-medium">No employees match your search parameters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Department & Designation</th>
                  <th className="p-4">Contact Details</th>
                  <th className="p-4">Competency & Gaps</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            emp.photo_url ||
                            '/default-avatar.svg'
                          }
                          alt={emp.first_name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">
                            {emp.first_name} {emp.last_name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">Joined {emp.join_date}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-800">{emp.designation}</p>
                      <p className="text-[11px] text-[#0A7A74] font-bold flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-[#0A7A74]" />
                        {emp.department_name}
                      </p>
                    </td>

                    <td className="p-4 text-[11px] text-slate-600 font-medium">
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {emp.email}
                      </p>
                      <p className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {emp.phone || 'N/A'}
                      </p>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-[#0A7A74] font-bold border border-teal-200/70">
                          {emp.skills_count || 0} Skills
                        </span>
                        {emp.high_gaps_count ? (
                          <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-800 font-bold border border-rose-200">
                            {emp.high_gaps_count} Gaps
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-[#0A7A74] font-bold border border-teal-200">
                            Optimal
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          emp.status === 'Active'
                            ? 'bg-teal-50 text-[#0A7A74] border-teal-200'
                            : emp.status === 'On Leave'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {emp.status === 'Active' && <CheckCircle className="w-3 h-3 text-[#0A7A74]" />}
                        {emp.status === 'On Leave' && <Clock className="w-3 h-3 text-amber-600" />}
                        {emp.status === 'Terminated' && <XCircle className="w-3 h-3 text-slate-400" />}
                        {emp.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/employees/${emp.id}`)}
                          className="p-2 text-slate-400 hover:text-[#0A7A74] hover:bg-[#E6F7F5] rounded-xl transition-all cursor-pointer"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-2 text-slate-400 hover:text-teal-600 hover:bg-[#E6F7F5] rounded-xl transition-all cursor-pointer"
                          title="Edit Record"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Employee">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0A7A74]"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0A7A74]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Work Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0A7A74]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Designation</label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0A7A74]"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Department</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0A7A74]"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0A7A74] hover:bg-[#086963] text-white font-bold rounded-xl shadow-sm"
            >
              Create Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Employee Profile">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0A7A74]"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0A7A74]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Work Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0A7A74]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Designation</label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0A7A74]"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Department</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0A7A74]"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Employment Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0A7A74]"
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0A7A74] hover:bg-[#086963] text-white font-bold rounded-xl shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
