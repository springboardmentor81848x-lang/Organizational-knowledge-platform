import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Plus,
  Search,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

function SummaryCard({ title, value, description, icon, iconClass }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h2 className="text-3xl font-bold text-slate-800 mt-3">{value}</h2>
          <p className="text-xs text-slate-400 mt-2">{description}</p>
        </div>
        <div className={`p-3 rounded-xl ${iconClass}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const role = (localStorage.getItem("role") || "HR").toUpperCase().replace(/^ROLE_/, "").replace(/_/g, " ").trim();

  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    managers: 0,
    mentors: 0,
    newEmployees: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [employeesRes] = await Promise.all([
        api.get("/employees")
      ]);

      const items = Array.isArray(employeesRes.data) ? employeesRes.data : [];
      setEmployees(items);
      setSummary({
        totalEmployees: items.length,
        activeEmployees: items.filter((e) => (e.role?.roleName || "").toUpperCase() !== "INACTIVE").length,
        inactiveEmployees: items.filter((e) => (e.role?.roleName || "").toUpperCase() === "INACTIVE").length,
        managers: items.filter((e) => (e.role?.roleName || "").toUpperCase() === "MANAGER").length,
        mentors: items.filter((e) => (e.role?.roleName || "").toUpperCase() === "MENTOR").length,
        newEmployees: 0,
      });
    } catch (err) {
      console.error("Error loading user management data:", err);
      setError("Unable to load employee directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const departments = useMemo(() => ["All", ...new Set(employees.map((item) => item.department?.departmentName || "Unassigned"))], [employees]);
  const roles = useMemo(() => ["All", ...new Set(employees.map((item) => item.role?.roleName || "Unassigned"))], [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchTerm = search.toLowerCase();
      const employeeRole = employee.role?.roleName || "Unassigned";
      const employeeStatus = employeeRole === "INACTIVE" ? "Inactive" : "Active";
      const nameMatch = `${employee.firstName || ""} ${employee.lastName || ""}`.toLowerCase().includes(searchTerm) || (employee.employeeId || "").toLowerCase().includes(searchTerm);
      const departmentMatch = departmentFilter === "All" || (employee.department?.departmentName || "Unassigned") === departmentFilter;
      const roleMatch = roleFilter === "All" || employeeRole === roleFilter;
      const statusMatch = statusFilter === "All" || employeeStatus === statusFilter;
      return nameMatch && departmentMatch && roleMatch && statusMatch;
    });
  }, [employees, search, departmentFilter, roleFilter, statusFilter]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="HR" />
        <div className="flex-1 min-w-0">
          <Navbar title="User Management" />
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-indigo-600" />
              <p className="text-slate-500">Loading employee directory...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="HR" />
        <div className="flex-1 min-w-0">
          <Navbar title="User Management" />
          <main className="p-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto">
              <AlertTriangle size={42} className="mx-auto text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-red-600">Unable to load</h2>
              <p className="text-slate-600 mt-3">{error}</p>
              <button onClick={fetchData} className="mt-6 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Try Again</button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={role} />
      <div className="flex-1 min-w-0">
        <Navbar title="User Management" />

        <main className="p-5 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
              <p className="text-slate-500 mt-2">Manage employees, roles, departments, and account status.</p>
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              <Plus size={18} />
              Add Employee
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-5 mb-8">
            <SummaryCard title="Total Employees" value={summary.totalEmployees} description="All active employees tracked" icon={<Users size={24} />} iconClass="bg-indigo-100 text-indigo-600" />
            <SummaryCard title="Active Employees" value={summary.activeEmployees} description="Employees with active access" icon={<UserCheck size={24} />} iconClass="bg-emerald-100 text-emerald-600" />
            <SummaryCard title="Inactive Employees" value={summary.inactiveEmployees} description="Accounts not currently active" icon={<UserX size={24} />} iconClass="bg-red-100 text-red-600" />
            <SummaryCard title="Managers" value={summary.managers} description="Managers in the organization" icon={<ShieldCheck size={24} />} iconClass="bg-blue-100 text-blue-600" />
            <SummaryCard title="Mentors" value={summary.mentors} description="Current mentor assignments" icon={<Users size={24} />} iconClass="bg-purple-100 text-purple-600" />
            <SummaryCard title="New Employees" value={summary.newEmployees} description="Employees joined recently" icon={<Plus size={24} />} iconClass="bg-cyan-100 text-cyan-600" />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Search by employee name or employee ID" />
              </div>
              <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-700">
                {departments.map((department) => <option key={department} value={department}>{department === "All" ? "All Departments" : department}</option>)}
              </select>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-700">
                {roles.map((role) => <option key={role} value={role}>{role === "All" ? "All Roles" : role}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-700">
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Employee ID</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Employee Name</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Email</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Department</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Designation</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Role</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Manager</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Joining Date</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length > 0 ? filteredEmployees.map((employee, index) => (
                    <tr key={employee.id || index} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-4 text-slate-700">{employee.employeeId || "—"}</td>
                      <td className="px-4 py-4 font-medium text-slate-800">{`${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "Unknown Employee"}</td>
                      <td className="px-4 py-4 text-slate-600">{employee.email || "—"}</td>
                      <td className="px-4 py-4 text-slate-600">{employee.department?.departmentName || "Unassigned"}</td>
                      <td className="px-4 py-4 text-slate-600">{employee.designation || "—"}</td>
                      <td className="px-4 py-4 text-slate-600">{employee.role?.roleName || "—"}</td>
                      <td className="px-4 py-4 text-slate-600">—</td>
                      <td className="px-4 py-4 text-slate-600"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${employee.role?.roleName === "INACTIVE" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>{employee.role?.roleName === "INACTIVE" ? "Inactive" : "Active"}</span></td>
                      <td className="px-4 py-4 text-slate-600">—</td>
                      <td className="px-4 py-4 text-slate-600">
                        <div className="flex items-center gap-2">
                          <button className="text-indigo-600 font-medium">View</button>
                          <button className="text-slate-600 font-medium">Edit</button>
                          <button className="text-orange-600 font-medium">Toggle</button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-slate-500">No employees found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
