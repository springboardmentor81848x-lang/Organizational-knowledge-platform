import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Search,
  Filter,
  PlusCircle,
  TrendingUp,
  Sparkles,
  Award,
  BookOpen,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Layers,
  BarChart2,
  DollarSign,
  Compass,
  Check,
  X,
  GraduationCap
} from 'lucide-react';
import api from '../services/api';
import { TargetRole, Department, Employee, Skill } from '../types';
import { useAuth } from '../context/AuthContext';
import { Toast, ToastMessage } from '../components/Toast';

export const TargetRolesModule: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [targetRoles, setTargetRoles] = useState<TargetRole[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [skillsList, setSkillsList] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Gap Analysis Modal
  const [selectedRoleForAnalysis, setSelectedRoleForAnalysis] = useState<TargetRole | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | ''>('');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Create Target Role Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    departmentId: 1,
    level: 'Senior' as const,
    description: '',
    salaryBand: '$130,000 - $160,000',
    selectedSkills: [] as Array<{ skill_id: number; required_proficiency: number }>,
  });
  const [creating, setCreating] = useState(false);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, deptRes, empRes, skillRes] = await Promise.all([
        api.get('/target-roles'),
        api.get('/departments'),
        api.get('/employees'),
        api.get('/skills'),
      ]);

      if (rolesRes.data.success) setTargetRoles(rolesRes.data.data);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (empRes.data.success) {
        setEmployees(empRes.data.data);
        if (empRes.data.data.length > 0 && !selectedEmployeeId) {
          // Default to current logged-in employee if exists, or first employee
          const myEmp = empRes.data.data.find((e: Employee) => e.user_id === user?.id);
          setSelectedEmployeeId(myEmp ? myEmp.id : empRes.data.data[0].id);
        }
      }
      if (skillRes.data.success) setSkillsList(skillRes.data.data);
    } catch (err) {
      console.error('Error fetching target roles:', err);
      addToast('error', 'Failed to load target roles data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Run Gap Analysis when role or employee changes in modal
  const runGapAnalysis = async (roleId: number, empId: number) => {
    try {
      setAnalyzing(true);
      const res = await api.get(`/target-roles/${roleId}/gap-analysis/${empId}`);
      if (res.data.success) {
        setAnalysisData(res.data.data);
      }
    } catch (err) {
      console.error('Error running gap analysis:', err);
      addToast('error', 'Could not compute target role gap analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleOpenAnalysisModal = (role: TargetRole) => {
    setSelectedRoleForAnalysis(role);
    const empId = selectedEmployeeId || (employees[0]?.id ?? 1);
    setSelectedEmployeeId(empId);
    runGapAnalysis(role.id, Number(empId));
  };

  const handleAssignTargetRole = async (role: TargetRole, empIdToAssign?: number) => {
    const empId = empIdToAssign || selectedEmployeeId || user?.employee?.id;
    if (!empId) {
      addToast('error', 'Please select an employee first');
      return;
    }

    try {
      const res = await api.put(`/target-roles/employee/${empId}`, {
        targetRoleId: role.id,
        targetRoleTitle: role.title,
      });

      if (res.data.success) {
        addToast('success', 'Target Role Assigned!', `Assigned "${role.title}" as active target role.`);
        fetchData();
        refreshUser();
        if (selectedRoleForAnalysis) {
          runGapAnalysis(role.id, Number(empId));
        }
      }
    } catch (err) {
      console.error('Error assigning target role:', err);
      addToast('error', 'Failed to assign target role');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim()) {
      addToast('error', 'Title is required');
      return;
    }
    if (createForm.selectedSkills.length === 0) {
      addToast('error', 'Please select at least one required skill');
      return;
    }

    try {
      setCreating(true);
      const res = await api.post('/target-roles', {
        title: createForm.title,
        departmentId: createForm.departmentId,
        level: createForm.level,
        description: createForm.description,
        salaryBand: createForm.salaryBand,
        requiredSkills: createForm.selectedSkills,
      });

      if (res.data.success) {
        addToast('success', 'Target Role Created', `Standard for ${createForm.title} successfully added.`);
        setShowCreateModal(false);
        setCreateForm({
          title: '',
          departmentId: 1,
          level: 'Senior',
          description: '',
          salaryBand: '$130,000 - $160,000',
          selectedSkills: [],
        });
        fetchData();
      }
    } catch (err) {
      console.error('Error creating target role:', err);
      addToast('error', 'Failed to create target role');
    } finally {
      setCreating(false);
    }
  };

  const toggleSkillInCreateForm = (skillId: number) => {
    setCreateForm((prev) => {
      const exists = prev.selectedSkills.some((s) => s.skill_id === skillId);
      if (exists) {
        return {
          ...prev,
          selectedSkills: prev.selectedSkills.filter((s) => s.skill_id !== skillId),
        };
      } else {
        return {
          ...prev,
          selectedSkills: [...prev.selectedSkills, { skill_id: skillId, required_proficiency: 4 }],
        };
      }
    });
  };

  const updateSkillProfInCreateForm = (skillId: number, prof: number) => {
    setCreateForm((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.map((s) =>
        s.skill_id === skillId ? { ...s, required_proficiency: prof } : s
      ),
    }));
  };

  const filteredRoles = targetRoles.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.department_name && r.department_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = !selectedDept || String(r.department_id) === selectedDept;
    const matchesLevel = !selectedLevel || r.level.toLowerCase() === selectedLevel.toLowerCase();

    return matchesSearch && matchesDept && matchesLevel;
  });

  const isHrOrAdmin = ['Admin', 'HR Specialist', 'Department Head', 'Manager'].includes(user?.role || '');

  return (
    <div className="space-y-6 text-xs pb-12">
      <Toast toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 font-bold text-[11px]">
              <Target className="w-3.5 h-3.5 text-teal-300" />
              Target Role Benchmarks & Career Roadmap Engine
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Target Role Intelligence & Readiness Matrix
            </h1>
            <p className="text-teal-100 text-xs leading-relaxed font-medium">
              Define enterprise career progression standards, evaluate employee readiness scores against promotion benchmarks, and automatically prescribe tailored training pathways.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isHrOrAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-teal-950 font-bold hover:bg-teal-50 shadow-sm transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-teal-700" />
                <span>Create Target Role</span>
              </button>
            )}
            <button
              onClick={() => navigate('/learning-path')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-700/60 border border-teal-400/30 text-white font-bold hover:bg-teal-700 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-teal-300" />
              <span>Learning Paths</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search target roles, skills, or departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          >
            <option value="">All Career Levels</option>
            <option value="Senior">Senior</option>
            <option value="Lead">Lead</option>
            <option value="Principal">Principal</option>
            <option value="Executive">Executive</option>
          </select>

          {/* Employee Focus Selector for Gap Analysis */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Evaluate Employee:</span>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
              className="py-2 px-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.designation})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Target Roles Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium">Loading target role benchmarks...</div>
      ) : filteredRoles.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
          <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No Target Roles Found</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRoles.map((role) => {
            const currentEmp = employees.find((e) => e.id === Number(selectedEmployeeId));
            const isAssigned = currentEmp?.target_role_id === role.id || currentEmp?.target_role === role.title;

            return (
              <div
                key={role.id}
                className={`bg-white border rounded-3xl p-5 shadow-2xs flex flex-col justify-between transition-all hover:shadow-md ${
                  isAssigned ? 'border-teal-500/80 ring-2 ring-teal-500/20' : 'border-slate-200/90'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-50 text-teal-800 border border-teal-200">
                      {role.department_name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700">
                        {role.level}
                      </span>
                      {isAssigned && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white flex items-center gap-1 shadow-2xs">
                          <Check className="w-2.5 h-2.5" /> Assigned
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-black text-slate-900 leading-snug mb-1">{role.title}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {role.description}
                  </p>

                  {/* Salary Band & Target Stats */}
                  {role.salary_band && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50/70 border border-emerald-200/60 rounded-xl px-2.5 py-1.5 mb-3.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Salary Band: {role.salary_band}</span>
                    </div>
                  )}

                  {/* Required Competencies Benchmark List */}
                  <div className="space-y-2 border-t border-slate-100 pt-3 mb-4">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                      <span>Required Competencies:</span>
                      <span className="text-[10px] text-teal-700 font-extrabold">
                        {role.required_skills.length} Skills
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {role.required_skills.map((skill) => (
                        <div
                          key={skill.skill_id}
                          className="flex items-center justify-between bg-slate-50/80 border border-slate-100 rounded-xl px-2.5 py-1.5"
                        >
                          <span className="text-[11px] font-semibold text-slate-800 truncate max-w-[170px]">
                            {skill.skill_name}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-slate-400">Req:</span>
                            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-teal-100/80 text-teal-900">
                              Lvl {skill.required_proficiency}/5
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenAnalysisModal(role)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-teal-900 hover:bg-teal-950 text-white font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                    <span>Run Gap Analysis ({currentEmp?.first_name || 'Employee'})</span>
                  </button>

                  <button
                    onClick={() => handleAssignTargetRole(role, Number(selectedEmployeeId))}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      isAssigned
                        ? 'bg-teal-50 border-teal-300 text-teal-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5 text-teal-600" />
                    <span>{isAssigned ? 'Active Target Role' : 'Set as Target Role'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gap Analysis Drawer / Modal */}
      {selectedRoleForAnalysis && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-900 to-emerald-950 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5 text-teal-300" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">{selectedRoleForAnalysis.title}</h3>
                  <p className="text-[11px] text-teal-200">
                    Career Readiness & Skill Gap Evaluation for {analysisData?.employee?.name || 'Selected Employee'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedRoleForAnalysis(null);
                  setAnalysisData(null);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Employee Selector Bar */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-slate-600">Employee under assessment:</span>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => {
                      setSelectedEmployeeId(Number(e.target.value));
                      runGapAnalysis(selectedRoleForAnalysis.id, Number(e.target.value));
                    }}
                    className="py-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.first_name} {e.last_name} ({e.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => handleAssignTargetRole(selectedRoleForAnalysis, Number(selectedEmployeeId))}
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Target className="w-3 h-3" /> Set as Target Role
                </button>
              </div>

              {analyzing ? (
                <div className="p-12 text-center text-slate-400 font-medium">Computing competency gaps...</div>
              ) : analysisData ? (
                <>
                  {/* Readiness Metrics Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="bg-teal-50/80 border border-teal-200/80 rounded-2xl p-3.5 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Readiness Score</p>
                      <p className="text-2xl font-black text-teal-950 mt-0.5">{analysisData.readiness_percentage}%</p>
                      <span className="text-[10px] font-bold text-teal-700 px-2 py-0.5 bg-teal-100/80 rounded-full mt-1 inline-block">
                        {analysisData.readiness_status}
                      </span>
                    </div>

                    <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-3.5 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Competency Deficit</p>
                      <p className="text-2xl font-black text-rose-950 mt-0.5">{analysisData.missing_competencies_count}</p>
                      <span className="text-[10px] font-medium text-rose-600 mt-1 block">Skills Below Target</span>
                    </div>

                    <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Target Met</p>
                      <p className="text-2xl font-black text-emerald-950 mt-0.5">{analysisData.ready_competencies_count}</p>
                      <span className="text-[10px] font-medium text-emerald-600 mt-1 block">Skills Ready</span>
                    </div>

                    <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Gap Points</p>
                      <p className="text-2xl font-black text-amber-950 mt-0.5">-{analysisData.total_gap_points}</p>
                      <span className="text-[10px] font-medium text-amber-600 mt-1 block">Proficiency Points</span>
                    </div>
                  </div>

                  {/* Competency Gap Breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Required Skills vs. Current Proficiency Breakdown
                    </h4>

                    <div className="space-y-2.5">
                      {analysisData.skills_analysis.map((item: any) => (
                        <div
                          key={item.skill_id}
                          className={`p-4 rounded-2xl border transition-all ${
                            item.is_met
                              ? 'bg-emerald-50/40 border-emerald-200'
                              : 'bg-white border-slate-200 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 text-xs">{item.skill_name}</span>
                                <span className="px-2 py-0.2 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">
                                  {item.category}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {item.is_met ? (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Benchmark Met
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" /> Gap: -{item.gap} Lvl
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Proficiency Comparison Bar */}
                          <div className="grid grid-cols-2 gap-4 text-[11px] mb-2">
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <div className="flex justify-between font-bold text-slate-600 mb-1">
                                <span>Current Level:</span>
                                <span className="text-slate-900 font-extrabold">{item.current_proficiency} / 5</span>
                              </div>
                              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-teal-600 h-full rounded-full"
                                  style={{ width: `${(item.current_proficiency / 5) * 100}%` }}
                                />
                              </div>
                            </div>

                            <div className="bg-teal-50/60 p-2 rounded-xl border border-teal-100">
                              <div className="flex justify-between font-bold text-teal-800 mb-1">
                                <span>Target Requirement:</span>
                                <span className="text-teal-950 font-black">{item.required_proficiency} / 5</span>
                              </div>
                              <div className="w-full bg-teal-200/70 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-teal-900 h-full rounded-full"
                                  style={{ width: `${(item.required_proficiency / 5) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Prescribed Training Recommendations */}
                          {!item.is_met && item.recommended_trainings && item.recommended_trainings.length > 0 && (
                            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                <span className="text-[11px] font-bold text-slate-700">
                                  Prescribed Training: {item.recommended_trainings[0].title}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedRoleForAnalysis(null);
                                  navigate('/training');
                                }}
                                className="px-2.5 py-1 bg-teal-900 hover:bg-teal-950 text-white font-bold rounded-lg text-[10px] shrink-0 transition-colors cursor-pointer"
                              >
                                Enroll Now →
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => navigate('/learning-path')}
                className="text-xs font-bold text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" /> View Curated Career Path
              </button>

              <button
                onClick={() => {
                  setSelectedRoleForAnalysis(null);
                  setAnalysisData(null);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Target Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-teal-900 text-white">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-300" />
                <h3 className="text-sm font-black">Create Target Role Standard</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Principal AI & Data Scientist"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Department *</label>
                  <select
                    value={createForm.departmentId}
                    onChange={(e) => setCreateForm({ ...createForm, departmentId: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Career Level *</label>
                  <select
                    value={createForm.level}
                    onChange={(e) => setCreateForm({ ...createForm, level: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Principal">Principal</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Salary Band</label>
                  <input
                    type="text"
                    placeholder="$140,000 - $175,000"
                    value={createForm.salaryBand}
                    onChange={(e) => setCreateForm({ ...createForm, salaryBand: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Role Description</label>
                  <input
                    type="text"
                    placeholder="Short description of career scope"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Skills Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-2">
                  Required Competency Benchmarks (Select Skills & Minimum Required Level):
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                  {skillsList.map((sk) => {
                    const selected = createForm.selectedSkills.find((s) => s.skill_id === sk.id);
                    return (
                      <div
                        key={sk.id}
                        className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                          selected ? 'bg-teal-50/80 border-teal-300' : 'bg-white border-slate-100'
                        }`}
                      >
                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={!!selected}
                            onChange={() => toggleSkillInCreateForm(sk.id)}
                            className="rounded text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-xs font-bold text-slate-800">{sk.name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">({sk.category})</span>
                        </label>

                        {selected && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-bold text-teal-800">Req Level:</span>
                            <select
                              value={selected.required_proficiency}
                              onChange={(e) => updateSkillProfInCreateForm(sk.id, Number(e.target.value))}
                              className="py-1 px-2 bg-white border border-teal-300 rounded-lg text-xs font-black text-teal-950 focus:outline-none"
                            >
                              <option value="3">3 (Competent)</option>
                              <option value="4">4 (Advanced)</option>
                              <option value="5">5 (Expert)</option>
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-teal-900 hover:bg-teal-950 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs cursor-pointer"
                >
                  {creating ? 'Saving...' : 'Save Target Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
