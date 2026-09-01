import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  Award,
  AlertTriangle,
  GraduationCap,
  BrainCircuit,
  ArrowRight,
  PlusCircle,
  BarChart2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Settings,
  BookOpen,
  Play,
  FileCheck,
  Filter,
  X,
  Clock,
  Check,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  UserCheck,
  HelpCircle,
  Send,
  Zap,
} from 'lucide-react';
import api from '../services/api';
import { AnalyticsData, KnowledgeGap } from '../types';
import { useAuth } from '../context/AuthContext';
import { Toast, ToastMessage } from '../components/Toast';
import { EmployeeSkillHeatmap } from '../components/EmployeeSkillHeatmap';
import { EmployeeLearningPathWidget } from '../components/EmployeeLearningPathWidget';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [managerData, setManagerData] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [recentGaps, setRecentGaps] = useState<KnowledgeGap[]>([]);
  const [employeeProfile, setEmployeeProfile] = useState<any>(null);
  const [myTrainings, setMyTrainings] = useState<any[]>([]);
  const [drilldownEmployee, setDrilldownEmployee] = useState<any>(null);
  const [loadingDrilldown, setLoadingDrilldown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Quick assessment modal/inline state for employee
  const [showQuickAssessment, setShowQuickAssessment] = useState(false);
  const [assessmentSkillId, setAssessmentSkillId] = useState<number>(1);
  const [assessmentProficiency, setAssessmentProficiency] = useState<number>(4);
  const [submittingAssessment, setSubmittingAssessment] = useState(false);

  // Assign training modal for manager
  const [assignModalData, setAssignModalData] = useState<{
    isOpen: boolean;
    employeeId: number;
    employeeName: string;
    skillId?: number;
    skillName?: string;
  } | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<number>(1);
  const [programsList, setProgramsList] = useState<any[]>([]);
  const [assigningTraining, setAssigningTraining] = useState(false);

  const role = user?.role || 'Employee';

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const isManager = role === 'Manager' || role === 'Department Head';
      const isAdminOrHr = role === 'Admin' || role === 'HR Specialist' || role === 'L&D Admin / Mentor' || role === 'L&D Admin';

      // 1. Fetch Manager or Admin Dashboard Data
      if (isManager || isAdminOrHr) {
        let deptIdParam = selectedDepartment !== 'All' ? `?departmentId=${selectedDepartment}` : '';
        if (isManager && user?.employee?.department_id && selectedDepartment === 'All') {
          deptIdParam = `?departmentId=${user.employee.department_id}`;
        }

        const [analyticsRes, gapsRes, managerRes, progRes] = await Promise.all([
          api.get(`/gaps/analytics${deptIdParam}`).catch(() => ({ data: { success: false, data: null } })),
          api.get(`/gaps?priority=High${deptIdParam ? `&departmentId=${user?.employee?.department_id}` : ''}`).catch(() => ({ data: { success: false, data: [] } })),
          api.get(`/manager/dashboard${deptIdParam}`).catch(() => ({ data: { success: false } })),
          api.get('/trainings/programs').catch(() => api.get('/trainings').catch(() => ({ data: { success: false, data: [] } }))),
        ]);

        if (analyticsRes.data?.success && analyticsRes.data.data) {
          setAnalytics(analyticsRes.data.data);
        }
        if (Array.isArray(gapsRes.data?.data)) {
          setRecentGaps(gapsRes.data.data.slice(0, 5));
        } else if (Array.isArray(gapsRes.data)) {
          setRecentGaps(gapsRes.data.slice(0, 5));
        }
        if (managerRes.data?.success) {
          setManagerData(managerRes.data);
        }
        if (progRes.data?.success && Array.isArray(progRes.data.data)) {
          setProgramsList(progRes.data.data);
        } else if (Array.isArray(progRes.data)) {
          setProgramsList(progRes.data);
        }
      }

      // 2. Fetch Employee Profile Data
      let targetEmpId = user?.employee?.id;
      if (!targetEmpId) {
        try {
          const meRes = await api.get('/auth/me');
          if (meRes.data?.success && meRes.data.user?.employee?.id) {
            targetEmpId = meRes.data.user.employee.id;
          }
        } catch (e) {
          // ignore
        }
      }

      if (targetEmpId) {
        const empRes = await api.get(`/employees/${targetEmpId}`).catch(() => ({ data: { success: false, data: null } }));
        if (empRes.data?.success && empRes.data.data) {
          setEmployeeProfile(empRes.data.data);
          setMyTrainings(empRes.data.data.trainingAssignments || []);
        }
      }
    } catch (err) {
      console.error('Error loading dashboard analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [role, user, selectedDepartment]);

  const handleQuickAssessmentSubmit = async () => {
    if (!user?.employee?.id) return;
    try {
      setSubmittingAssessment(true);
      const res = await api.post('/assessments/evaluate', {
        employeeId: user.employee.id,
        skillId: assessmentSkillId,
        proficiencyLevel: assessmentProficiency,
        assessmentType: 'Self Evaluation & Competency Benchmark',
      });

      if (res.data.success) {
        addToast(
          'success',
          'Assessment Recorded & Gaps Recalculated',
          `Your skill level has been updated to Level ${assessmentProficiency}/5. Knowledge gaps recalculated automatically!`
        );
        setShowQuickAssessment(false);
        fetchDashboardData();
      }
    } catch (err: any) {
      addToast('error', 'Assessment Submission Failed', err.response?.data?.message || err.message);
    } finally {
      setSubmittingAssessment(false);
    }
  };

  const handleAssignTrainingSubmit = async () => {
    if (!assignModalData) return;
    try {
      setAssigningTraining(true);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const dueDateStr = dueDate.toISOString().split('T')[0];

      const res = await api.post('/trainings/assign', {
        employeeId: assignModalData.employeeId,
        trainingProgramId: selectedProgramId,
        dueDate: dueDateStr,
      });

      if (res.data.success) {
        addToast(
          'success',
          'Training Assigned Successfully',
          `Program assigned to ${assignModalData.employeeName}. Learning path updated.`
        );
        setAssignModalData(null);
        fetchDashboardData();
      }
    } catch (err: any) {
      addToast('error', 'Training Assignment Failed', err.response?.data?.message || err.message);
    } finally {
      setAssigningTraining(false);
    }
  };

  const handleUpdateProgress = async (assignmentId: number, currentProgress: number) => {
    const newProgress = Math.min(100, currentProgress + 25);
    try {
      const res = await api.put(`/trainings/assignments/${assignmentId}/progress`, {
        progressPercentage: newProgress,
        status: newProgress >= 100 ? 'Completed' : 'In Progress',
      });
      if (res.data.success) {
        addToast('success', 'Training Progress Saved', `Progress updated to ${newProgress}%.`);
        fetchDashboardData();
      }
    } catch (err) {
      addToast('error', 'Failed to update training progress');
    }
  };

  const handleOpenDrilldown = async (empId: number) => {
    try {
      setLoadingDrilldown(true);
      const res = await api.get(`/manager/employee-drilldown/${empId}`);
      if (res.data.success) {
        setDrilldownEmployee(res.data);
      }
    } catch (err) {
      addToast('error', 'Failed to load employee drilldown');
    } finally {
      setLoadingDrilldown(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-bold">Computing Role-Based Intelligence...</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 1. EMPLOYEE DASHBOARD VIEW
  // =========================================================================
  if (role === 'Employee') {
    const mySkillsCount = employeeProfile?.skills?.length || 0;
    const isAssessed = mySkillsCount > 0;
    const myGapsCount = employeeProfile?.gaps?.length || 0;
    const myTrainingsCount = myTrainings.length;
    const activeGaps = employeeProfile?.gaps || [];
    const deptRequiredSkills = employeeProfile?.department_required_skills || [];

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-xs">
        <Toast toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

        {/* Hero Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-950 border border-emerald-800 rounded-3xl p-6 shadow-xl text-white">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold mb-2 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Employee Skill Portal • {employeeProfile?.department?.name || 'Software Engineering'}</span>
              </div>
              <h1 className="text-xl font-extrabold tracking-wide">
                Welcome back, {user?.employee?.first_name || 'Team Member'}!
              </h1>
              <p className="text-slate-200 text-xs mt-1 max-w-2xl leading-relaxed">
                {isAssessed ? (
                  <>
                    You currently have <strong className="text-amber-300">{myGapsCount} active skill gaps</strong> and{' '}
                    <strong className="text-emerald-300">{myTrainingsCount} enrolled training programs</strong>.
                    Complete your assignments to satisfy department competency benchmarks.
                  </>
                ) : (
                  <>
                    Your competency profile is currently in{' '}
                    <strong className="text-amber-300 font-bold">Assessment Pending / Not Assessed</strong> status.
                    Complete your skill evaluation below to compute your gaps and receive tailored AI training paths.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isAssessed ? (
                <button
                  onClick={() => setShowQuickAssessment(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Start Skill Assessment</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/assessments')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Skill Assessment Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Assessment Pending Alert Banner (Explicit Guidance) */}
        {!isAssessed && (
          <div className="bg-amber-500/10 border-2 border-amber-400/60 rounded-3xl p-5 text-amber-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-300 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <span>Assessment Pending / Not Assessed</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black uppercase">
                    Action Required
                  </span>
                </h3>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  You have not submitted a skill competency evaluation yet. Note that missing assessment data is{' '}
                  <strong>NOT considered as zero gaps</strong>. Submit your self-evaluation or complete the formal
                  assessment to automatically recalculate gaps and unlock AI recommendations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowQuickAssessment(true)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold py-2 px-3.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all text-xs"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Quick Evaluation</span>
              </button>
              <button
                onClick={() => navigate('/assessments')}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2 px-3.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all text-xs"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Full Exam</span>
              </button>
            </div>
          </div>
        )}

        {/* Interactive Quick Assessment Card (When Opened or Pending) */}
        {showQuickAssessment && (
          <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 shadow-xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Direct Competency Assessment</h3>
                  <p className="text-[11px] text-slate-500">
                    Select a required skill for your department and rate your verified proficiency.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQuickAssessment(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Skill to Evaluate:</label>
                <select
                  value={assessmentSkillId}
                  onChange={(e) => setAssessmentSkillId(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                >
                  <option value={1}>React & Frontend Architecture (Required Level: 5)</option>
                  <option value={2}>Node.js & Microservices (Required Level: 5)</option>
                  <option value={3}>Cloud Infrastructure (AWS/GCP) (Required Level: 4)</option>
                  <option value={4}>SQL & Database Optimization (Required Level: 4)</option>
                  <option value={5}>Cybersecurity & Risk Audit (Required Level: 5)</option>
                  <option value={6}>Agile Team Leadership (Required Level: 4)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Demonstrated Proficiency Level: <strong className="text-emerald-700">Level {assessmentProficiency}/5</strong>
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setAssessmentProficiency(lvl)}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        assessmentProficiency === lvl
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      L{lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                Gap score will automatically compute as: <strong className="text-slate-800">Required - Level {assessmentProficiency}</strong>
              </span>
              <button
                onClick={handleQuickAssessmentSubmit}
                disabled={submittingAssessment}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {submittingAssessment ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Submit & Recalculate Gaps</span>
              </button>
            </div>
          </div>
        )}

        {/* Employee KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Assessed Skills</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{isAssessed ? mySkillsCount : 'Pending'}</p>
            <p className="text-[10px] text-emerald-700 font-bold mt-1">
              {isAssessed ? 'Verified Competencies' : 'Assessment Pending'}
            </p>
          </div>

          <div
            className={`border rounded-2xl p-4 shadow-2xs ${
              isAssessed ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-amber-700 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Knowledge Gaps</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-950">{isAssessed ? myGapsCount : 'Not Assessed'}</p>
            <p className="text-[10px] text-amber-700 font-bold mt-1">
              {isAssessed ? 'Target Skill Deficits' : 'Evaluation Pending'}
            </p>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-800 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Enrolled Trainings</span>
              <GraduationCap className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-950">{myTrainingsCount}</p>
            <p className="text-[10px] text-emerald-700 font-bold mt-1">Upskilling Modules</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Department Unit</span>
              <Building2 className="w-4 h-4 text-violet-600" />
            </div>
            <p className="text-lg font-black text-slate-900 truncate">
              {employeeProfile?.department?.name || 'Software Engineering'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Code: {employeeProfile?.department?.code || 'ENG'}</p>
          </div>
        </div>

        {/* Employee Verified Skills vs Department Requirements Breakdown */}
        {isAssessed && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  My Assessed Competencies & Department Benchmarks
                </h2>
                <p className="text-[11px] text-slate-500">
                  Actual assessment scores vs department required proficiency standard
                </p>
              </div>
              <button
                onClick={() => setShowQuickAssessment(true)}
                className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Skill Evaluation</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deptRequiredSkills.map((req: any) => {
                const currentLevel = req.current_proficiency || 0;
                const requiredLevel = req.required_proficiency || 4;
                const deficit = Math.max(0, requiredLevel - currentLevel);
                const isMet = currentLevel >= requiredLevel;

                return (
                  <div
                    key={req.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isMet
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-amber-50/50 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-xs truncate max-w-[180px]">{req.skill_name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isMet ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isMet ? 'Satisfied' : `Deficit: -${deficit}`}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-slate-600">
                        <span>Current Rating:</span>
                        <strong className={isMet ? 'text-emerald-700' : 'text-amber-800'}>
                          Level {currentLevel}/5
                        </strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Required Benchmark:</span>
                        <strong className="text-slate-900">Level {requiredLevel}/5</strong>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full ${
                            isMet ? 'bg-emerald-600' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, (currentLevel / 5) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Employee Skill & Knowledge Gap Heatmap */}
        <EmployeeSkillHeatmap employeeId={user?.employee?.id} />

        {/* Dynamic Learning Path Widget */}
        <EmployeeLearningPathWidget />

        {/* My Enrolled Trainings & Active Gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Training Enrollments */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                My Enrolled Training Programs
              </h2>
              <button
                onClick={() => navigate('/training')}
                className="text-[11px] text-emerald-700 font-bold hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {myTrainings.length === 0 ? (
                <p className="text-slate-400 text-center py-6 font-medium">No training programs assigned currently.</p>
              ) : (
                myTrainings.map((ta) => (
                  <div key={ta.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{ta.program_title}</p>
                        <p className="text-[10px] text-slate-500">Category: {ta.category || 'Professional'}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        {ta.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-600 font-bold">
                        <span>Progress</span>
                        <span>{ta.progress_percentage}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${ta.progress_percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 font-medium">Due Date: {ta.due_date}</span>
                      <button
                        onClick={() => handleUpdateProgress(ta.id, ta.progress_percentage)}
                        className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Play className="w-3 h-3" />
                        <span>Update Progress (+25%)</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Active Gaps */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-amber-600" />
                My Identified Knowledge Gaps
              </h2>
              <button onClick={() => navigate('/gaps')} className="text-[11px] text-emerald-700 font-bold hover:underline">
                View My Gaps
              </button>
            </div>

            <div className="space-y-3">
              {!isAssessed ? (
                <div className="p-6 text-center text-amber-900 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
                  <AlertTriangle className="w-8 h-8 mx-auto text-amber-600" />
                  <p className="font-bold text-xs text-amber-950">Assessment Pending / Not Assessed</p>
                  <p className="text-[11px] text-amber-800 font-medium max-w-md mx-auto">
                    Skill gaps cannot be computed until you complete your skill evaluation.
                  </p>
                  <button
                    onClick={() => setShowQuickAssessment(true)}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-[11px] hover:bg-amber-500 cursor-pointer shadow-xs"
                  >
                    <span>Take Quick Evaluation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : activeGaps.length === 0 ? (
                <div className="p-6 text-center text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                  <p className="font-bold">All Competency Standards Satisfied!</p>
                  <p className="text-[11px] text-emerald-700 mt-1 font-medium">You meet or exceed all proficiency expectations.</p>
                </div>
              ) : (
                activeGaps.map((gap: any) => (
                  <div key={gap.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{gap.skill_name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Deficit: -{gap.gap_score} (Priority: {gap.priority})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Required Level: <strong className="text-slate-900">{gap.required_proficiency}</strong> | Current Level:{' '}
                      <strong className="text-slate-900">{gap.current_proficiency}</strong>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Mentorship & Knowledge Sharing Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Active Mentorship & Skill Growth
              </h2>
              <button onClick={() => navigate('/mentorship')} className="text-[11px] text-emerald-700 font-bold hover:underline">
                Open Mentorship Hub →
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-emerald-100/80 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Assigned Mentor</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">Elena Rostova (Senior L&D Mentor)</div>
                <div className="text-[11px] text-slate-500">Domain: Cloud & Architecture • Active 1-on-1 Cohort</div>
              </div>
              <button
                onClick={() => navigate('/mentorship')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs"
              >
                Schedule Sync
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50/80 to-white border border-indigo-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Upcoming Knowledge-Sharing Workshops
              </h2>
              <button onClick={() => navigate('/mentorship')} className="text-[11px] text-indigo-700 font-bold hover:underline">
                View Workshops →
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-indigo-100/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  Live Tech Session
                </span>
                <div className="text-xs font-bold text-slate-900 mt-1">Spring Boot 3 Enterprise & Cloud Native Deployments</div>
                <div className="text-[11px] text-slate-500">Aug 24 • 15:00 UTC • Google Meet</div>
              </div>
              <button
                onClick={() => navigate('/mentorship')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs"
              >
                Join Workshop
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. MANAGER / DEPARTMENT HEAD DASHBOARD (TEAM-SCOPED ONLY)
  // =========================================================================
  if (role === 'Manager' || role === 'Department Head') {
    const deptInfo = managerData?.scopedDepartment;
    const teamCoverage = managerData?.teamSkillCoverage || [];
    const teamMembers = managerData?.teamMembers || [];
    const teamHighRisk = managerData?.teamHighRiskAlerts || [];
    const mMetrics = managerData?.metrics || {};

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-xs">
        <Toast toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

        {/* Manager Team Scope Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border border-blue-800/80 rounded-3xl p-6 shadow-xl text-white">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-bold mb-2 text-[11px]">
                <Users className="w-3.5 h-3.5 text-blue-300" />
                <span>Department Manager View • Data Scoped to {deptInfo?.name || 'Department'}</span>
              </div>
              <h1 className="text-xl font-extrabold tracking-wide">
                {deptInfo?.name || 'Team Department'} Management Dashboard
              </h1>
              <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
                Supervising <strong className="text-emerald-300">{mMetrics.totalEmployees || teamMembers.length} team members</strong> in{' '}
                {deptInfo?.name || 'Department'}. Track individual progress, team skill coverage benchmarks, and remediate high-risk skill deficits.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <div className="px-3 py-2 rounded-xl bg-blue-900/60 border border-blue-700 text-blue-200 text-right">
                <span className="text-[10px] uppercase font-bold text-blue-300 block">Department Scope</span>
                <strong className="text-xs font-black text-white">{deptInfo?.code || 'ENG'}</strong>
              </div>
              <button
                onClick={() => navigate('/gaps')}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Team Gap Matrix</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Manager Team KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">Team Size</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{mMetrics.totalEmployees || teamMembers.length}</p>
            <p className="text-[10px] text-blue-700 font-bold mt-1">Direct Department Staff</p>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-800 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">Assessed Staff</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-950">{mMetrics.assessedEmployeesCount || 0}</p>
            <p className="text-[10px] text-emerald-700 font-bold mt-1">Evaluations Completed</p>
          </div>

          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-amber-700 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pending Assessment</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-950">{mMetrics.pendingAssessmentCount || 0}</p>
            <p className="text-[10px] text-amber-700 font-bold mt-1">Awaiting Evaluation</p>
          </div>

          <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-rose-700 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">High-Risk Gaps</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-black text-rose-950">{mMetrics.highRiskGapsCount || 0}</p>
            <p className="text-[10px] text-rose-700 font-bold mt-1">Deficit ≥ 2 levels</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">Training Adoption</span>
              <GraduationCap className="w-4 h-4 text-violet-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{mMetrics.trainingCompletionRate || 0}%</p>
            <p className="text-[10px] text-violet-700 font-bold mt-1">Course Completion Rate</p>
          </div>
        </div>

        {/* Team Skill Coverage Matrix */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                Team Skill Coverage Benchmark Matrix
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Percentage of team members meeting or exceeding department competency benchmarks
              </p>
            </div>
            <button onClick={() => navigate('/skills')} className="text-[11px] text-blue-700 font-bold hover:underline">
              View Skills Catalog →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamCoverage.map((sc: any) => (
              <div key={sc.skillId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs truncate max-w-[160px]">{sc.skillName}</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                    Req: L{sc.requiredProficiency}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600 font-bold">
                    <span>Team Coverage</span>
                    <strong className="text-slate-900">{sc.coveragePercentage}%</strong>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        sc.coveragePercentage >= 80
                          ? 'bg-emerald-600'
                          : sc.coveragePercentage >= 50
                          ? 'bg-blue-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.max(5, sc.coveragePercentage)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/50">
                  <span>
                    Satisfied: <strong className="text-slate-900">{sc.teamSatisfiedCount}/{sc.totalTeamMembers}</strong>
                  </span>
                  <span>
                    Avg Rating: <strong className="text-slate-900">L{sc.averageProficiency}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team High-Risk Skill Gap Alerts */}
        {teamHighRisk.length > 0 && (
          <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <h2 className="font-bold text-rose-950 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                High-Risk Team Skill Deficits (Immediate Intervention Required)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                {teamHighRisk.length} High Deficits
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {teamHighRisk.map((alert: any) => (
                <div key={alert.gapId} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 text-rose-800 flex items-center justify-center font-black text-xs shrink-0">
                      -{alert.gapScore}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">
                        {alert.employeeName} <span className="text-slate-500 font-normal">({alert.employeeDesignation})</span>
                      </p>
                      <p className="text-[11px] text-rose-700 font-bold mt-0.5">
                        Deficit in {alert.skillName} (Benchmark: L{alert.requiredProficiency} | Current: L{alert.currentProficiency})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">AI Recommended Course</span>
                      <span className="text-xs font-bold text-slate-800">{alert.recommendedProgram}</span>
                    </div>
                    <button
                      onClick={() =>
                        setAssignModalData({
                          isOpen: true,
                          employeeId: alert.employeeId,
                          employeeName: alert.employeeName,
                          skillId: alert.skillId,
                          skillName: alert.skillName,
                        })
                      }
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Assign Course</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Individual Team Member Progress Table */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Team Roster & Individual Competency Progress
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Detailed view of team member assessment status, active gaps, and course progress
              </p>
            </div>
            <span className="text-[11px] text-slate-500 font-bold">
              Total Members: {teamMembers.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                  <th className="pb-3 font-bold">Team Member</th>
                  <th className="pb-3 font-bold">Assessment Status</th>
                  <th className="pb-3 font-bold">Assessed Skills</th>
                  <th className="pb-3 font-bold">Active Gaps</th>
                  <th className="pb-3 font-bold">Training Progress</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamMembers.map((member: any) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 font-bold flex items-center justify-center text-slate-700 text-xs overflow-hidden">
                          {member.photoUrl ? (
                            <img
                              src={member.photoUrl}
                              alt={member.name}
                              onError={(e) => ((e.target as HTMLImageElement).src = '/default-avatar.svg')}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            member.firstName?.[0] || 'U'
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{member.name}</p>
                          <p className="text-[10px] text-slate-500">{member.designation}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          member.isAssessed
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {member.isAssessed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Assessed</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Assessment Pending</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3">
                      <span className="font-bold text-slate-800">{member.skillsCount} Skills</span>
                      <span className="text-[10px] text-slate-400 block">Avg Rating: {member.avgSkillPercent}%</span>
                    </td>

                    <td className="py-3">
                      {member.gapsCount > 0 ? (
                        <div>
                          <span className="font-bold text-amber-800">{member.gapsCount} Gaps</span>
                          {member.highRiskGapsCount > 0 && (
                            <span className="text-[10px] text-rose-600 font-bold block">
                              ({member.highRiskGapsCount} High-Risk)
                            </span>
                          )}
                        </div>
                      ) : member.isAssessed ? (
                        <span className="text-emerald-700 font-bold">0 Gaps (Satisfied)</span>
                      ) : (
                        <span className="text-slate-400">Pending Evaluation</span>
                      )}
                    </td>

                    <td className="py-3">
                      <div className="w-32 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-600">
                          <span>{member.trainingEnrollmentCount} Enrolled</span>
                          <span>{member.trainingCompletionRate}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${member.trainingCompletionRate}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDrilldown(member.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() =>
                            setAssignModalData({
                              isOpen: true,
                              employeeId: member.id,
                              employeeName: member.name,
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer shadow-xs"
                        >
                          + Assign
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assign Training Program Modal for Manager */}
        {assignModalData?.isOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Assign Training Program</h3>
                    <p className="text-[11px] text-slate-500">
                      Team Member: <strong className="text-slate-800">{assignModalData.employeeName}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAssignModalData(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Training Course:</label>
                <select
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                >
                  {programsList.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.duration_hours}h • {p.provider || 'OKGIP Academy'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-[11px] text-emerald-900 space-y-1">
                <p className="font-bold">Automated Learning Path Synchronizer:</p>
                <p>
                  Upon assignment, this module will be added to {assignModalData.employeeName}'s active Learning Path with a
                  30-day completion target.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModalData(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignTrainingSubmit}
                  disabled={assigningTraining}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {assigningTraining ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <GraduationCap className="w-3.5 h-3.5" />
                  )}
                  <span>Confirm Assignment</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Employee Drilldown Modal */}
        {drilldownEmployee && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-base flex items-center justify-center border border-emerald-300">
                    {drilldownEmployee.employee.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">{drilldownEmployee.employee.name}</h3>
                    <p className="text-xs text-slate-500">
                      {drilldownEmployee.employee.designation} • {drilldownEmployee.employee.departmentName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDrilldownEmployee(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drilldown Content */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-xs text-slate-800 mb-2">Verified Skill Levels</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {drilldownEmployee.skills.map((s: any) => (
                      <div key={s.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between">
                        <span className="font-semibold text-slate-900">{s.skill_name || 'Skill'}</span>
                        <span className="font-black text-emerald-700">Level {s.current_proficiency}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-slate-800 mb-2">Active Knowledge Gaps</h4>
                  {drilldownEmployee.gaps.length === 0 ? (
                    <p className="text-emerald-700 text-xs font-bold">No active knowledge gaps!</p>
                  ) : (
                    <div className="space-y-2">
                      {drilldownEmployee.gaps.map((g: any) => (
                        <div key={g.id} className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs flex justify-between">
                          <span className="font-bold text-slate-900">{g.skill_name}</span>
                          <span className="font-bold text-amber-800">Deficit: -{g.gap_score}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-xs text-slate-800 mb-2">Assessment History</h4>
                  {drilldownEmployee.assessments.length === 0 ? (
                    <p className="text-slate-400 text-xs">No recorded assessment attempts.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {drilldownEmployee.assessments.map((a: any) => (
                        <div key={a.id} className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between">
                          <span>{a.assessment_title || a.skill_name}</span>
                          <span className="font-bold text-slate-900">{a.score}% ({a.passed ? 'Passed' : 'Failed'})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    const id = drilldownEmployee.employee.id;
                    setDrilldownEmployee(null);
                    navigate(`/employees/${id}`);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  View Full Employee Profile <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 3. ADMIN / HR SPECIALIST DASHBOARD (ORGANIZATION-WIDE INTELLIGENCE)
  // =========================================================================
  const m = managerData?.metrics || analytics?.metrics;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-xs">
      <Toast toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-950 border border-emerald-800 rounded-3xl p-6 shadow-xl text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold mb-2 text-[11px]">
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-300" />
              <span>{role === 'Admin' ? 'Enterprise Governance Engine' : 'Organization Workforce Analytics'}</span>
            </div>
            <h1 className="text-xl font-extrabold tracking-wide">
              Welcome back, {user?.employee ? `${user.employee.first_name} ${user.employee.last_name}` : role}
            </h1>
            <p className="text-slate-200 text-xs mt-1 max-w-2xl leading-relaxed">
              OKGIP intelligence engine connected to <strong className="text-emerald-300">MySQL</strong> database. Currently tracking{' '}
              <span className="text-amber-300 font-extrabold">{m?.highRiskGapsCount || m?.highPriorityGaps || 0} high-risk knowledge gaps</span> across{' '}
              {m?.totalDepartments || 5} enterprise departments.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Department Filter Dropdown */}
            {managerData?.departments && (
              <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 shadow-md">
                <Filter className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold text-slate-300 uppercase">Dept:</span>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
                >
                  <option value="All" className="bg-slate-900 text-white">
                    All Departments
                  </option>
                  {managerData.departments.map((d: any) => (
                    <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => navigate('/gaps')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Analyze All Gaps</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (Real MySQL Data) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Employees</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{m?.totalEmployees || 9}</p>
          <p className="text-[10px] text-emerald-700 font-bold mt-1">Active Workforce</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Skill Level</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{m?.averageSkillLevel || 68}%</p>
          <p className="text-[10px] text-emerald-700 font-bold mt-1">Competency Avg</p>
        </div>

        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-amber-700 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">High Risk Gaps</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-950">{m?.highRiskGapsCount || m?.highPriorityGaps || 0}</p>
          <p className="text-[10px] text-amber-700 font-bold mt-1">Deficit ≥ 2 levels</p>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-emerald-800 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Training Rate</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-950">{m?.trainingCompletionRate || 75}%</p>
          <p className="text-[10px] text-emerald-700 font-bold mt-1">Completed Modules</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Learning Paths</span>
            <BookOpen className="w-4 h-4 text-violet-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{m?.learningPathProgress || 80}%</p>
          <p className="text-[10px] text-violet-700 font-bold mt-1">Resource Progress</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Leaves</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{m?.pendingLeavesCount || 0}</p>
          <p className="text-[10px] text-indigo-700 font-bold mt-1">Action Required</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Unassessed</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{m?.pendingAssessmentCount || m?.pendingAssessmentsCount || 1}</p>
          <p className="text-[10px] text-rose-600 font-bold mt-1">Pending Exams</p>
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Gap Breakdown */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                Department Knowledge Gap Distribution
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Total gaps & high-priority flags per department</p>
            </div>
            <button onClick={() => navigate('/departments')} className="text-[11px] text-emerald-700 font-bold hover:underline">
              View Depts
            </button>
          </div>

          <div className="space-y-3.5 pt-2">
            {analytics?.departmentBreakdown?.map((dept) => {
              const total = analytics.metrics?.totalGaps || 1;
              const barWidth = Math.min(100, Math.round((dept.total_gaps / total) * 100 * 2.5));

              return (
                <div key={dept.department_id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{dept.department_name}</span>
                    <span className="text-slate-500 text-[11px] font-medium">
                      <strong className="text-slate-900">{dept.total_gaps}</strong> total gaps (
                      <span className="text-amber-600 font-bold">{dept.high_gaps} high</span>)
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/50">
                    <div
                      className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-500 shadow-xs"
                      style={{ width: `${Math.max(8, barWidth)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* High Risk Skills Ranking */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-violet-600" />
              High Risk Skills Deficiencies
            </h2>
            <button onClick={() => navigate('/skills')} className="text-[11px] text-emerald-700 font-bold hover:underline">
              Skills Catalog
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {managerData?.highRiskSkills?.map((sk: any) => (
              <div key={sk.skillId} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{sk.skillName}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{sk.category}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-200">
                    {sk.gapCount} gaps
                  </span>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Avg Deficit: -{sk.avgGapScore}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Employees Section */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Top Performing Employees (Ranked by Skill & Training Verification)
          </h2>
          <button onClick={() => navigate('/employees')} className="text-[11px] text-emerald-700 font-bold hover:underline">
            All Employees
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {managerData?.topPerformers?.map((emp: any, idx: number) => (
            <div
              key={emp.id}
              onClick={() => handleOpenDrilldown(emp.id)}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 space-y-3 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center border border-amber-300">
                  #{idx + 1}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {emp.performanceScore || 85}% Score
                </span>
              </div>

              <div>
                <p className="font-bold text-slate-900 text-xs truncate">{emp.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{emp.designation}</p>
                <p className="text-[10px] text-slate-400 font-medium">{emp.departmentName || 'Engineering'}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Skill Rating:</span>
                  <strong className="text-slate-900">{emp.skillAvgPercent || 80}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Training Done:</span>
                  <strong className="text-emerald-700">{emp.trainingCompletionRate || 100}%</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Gap Timeline & Management Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Gap Timeline */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              High Priority Knowledge Gap Alerts
            </h2>
            <button onClick={() => navigate('/gaps')} className="text-[11px] text-emerald-700 font-bold hover:underline">
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentGaps.length === 0 ? (
              <p className="p-4 text-slate-500 text-center font-medium">No critical gaps detected.</p>
            ) : (
              recentGaps.map((gap) => (
                <div key={gap.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center font-black text-xs shrink-0">
                      -{gap.gap_score}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {gap.employee_name} <span className="text-slate-500 font-normal">({gap.department_name})</span>
                      </p>
                      <p className="text-[11px] text-emerald-700 font-bold">{gap.skill_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      Req: {gap.required_proficiency} | Curr: {gap.current_proficiency}
                    </span>
                    <button
                      onClick={() => navigate(`/training`)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Assign Training
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Operations Panel */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-4 h-4 text-violet-600" />
            Quick Management Actions
          </h2>

          <div className="space-y-2.5">
            {role === 'Admin' && (
              <button
                onClick={() => navigate('/users')}
                className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-800 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span className="font-bold">Manage Users & RBAC</span>
                </div>
                <PlusCircle className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </button>
            )}

            <button
              onClick={() => navigate('/employees')}
              className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-800 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">Manage Employees</span>
              </div>
              <PlusCircle className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </button>

            <button
              onClick={() => navigate('/skills')}
              className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-800 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-violet-600" />
                <span className="font-bold">Assess Skill Proficiency</span>
              </div>
              <PlusCircle className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition-colors" />
            </button>

            <button
              onClick={() => navigate('/training')}
              className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-800 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-teal-600" />
                <span className="font-bold">Assign Training Program</span>
              </div>
              <PlusCircle className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
            </button>

            {role === 'Admin' && (
              <button
                onClick={() => navigate('/settings')}
                className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-800 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-slate-600" />
                  <span className="font-bold">System Settings</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Employee Drilldown Modal */}
      {drilldownEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-base flex items-center justify-center border border-emerald-300">
                  {drilldownEmployee.employee.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">{drilldownEmployee.employee.name}</h3>
                  <p className="text-xs text-slate-500">
                    {drilldownEmployee.employee.designation} • {drilldownEmployee.employee.departmentName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDrilldownEmployee(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drilldown Content */}
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-xs text-slate-800 mb-2">Verified Skill Levels</h4>
                <div className="grid grid-cols-2 gap-2">
                  {drilldownEmployee.skills.map((s: any) => (
                    <div key={s.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between">
                      <span className="font-semibold text-slate-900">{s.skill_name || 'Skill'}</span>
                      <span className="font-black text-emerald-700">Level {s.current_proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-800 mb-2">Active Knowledge Gaps</h4>
                {drilldownEmployee.gaps.length === 0 ? (
                  <p className="text-emerald-700 text-xs font-bold">No active knowledge gaps!</p>
                ) : (
                  <div className="space-y-2">
                    {drilldownEmployee.gaps.map((g: any) => (
                      <div key={g.id} className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs flex justify-between">
                        <span className="font-bold text-slate-900">{g.skill_name}</span>
                        <span className="font-bold text-amber-800">Deficit: -{g.gap_score}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-800 mb-2">Assessment History</h4>
                {drilldownEmployee.assessments.length === 0 ? (
                  <p className="text-slate-400 text-xs">No recorded assessment attempts.</p>
                ) : (
                  <div className="space-y-1.5">
                    {drilldownEmployee.assessments.map((a: any) => (
                      <div key={a.id} className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between">
                        <span>{a.assessment_title || a.skill_name}</span>
                        <span className="font-bold text-slate-900">{a.score}% ({a.passed ? 'Passed' : 'Failed'})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="text-right pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  const id = drilldownEmployee.employee.id;
                  setDrilldownEmployee(null);
                  navigate(`/employees/${id}`);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                View Full Employee Profile <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
