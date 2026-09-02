import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  BookOpen,
  CheckCircle,
  Award,
  Clock,
  UserCheck,
  Download,
  Percent,
  TrendingUp,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  AlertTriangle,
  RotateCw,
  ShieldCheck,
  Check,
  Search,
  Filter,
  BarChart3,
  Users,
  ChevronDown,
  ChevronUp,
  FileCheck,
  ExternalLink,
  Flame,
  Zap,
  Target
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  TrainingProgram,
  TrainingAssignment,
  Employee,
  Skill,
  TrainingRecommendation,
  CourseModuleItem,
  LearningMilestoneItem
} from '../types';
import { Modal } from '../components/Modal';
import { Toast, ToastMessage } from '../components/Toast';

export const TrainingModule: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'my_learning' | 'catalog' | 'velocity_analytics'>('my_learning');

  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [recommendations, setRecommendations] = useState<TrainingRecommendation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [velocityData, setVelocityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals & UI States
  const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<TrainingAssignment | null>(null);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [activeAssignmentModules, setActiveAssignmentModules] = useState<CourseModuleItem[]>([]);
  const [activeAssignmentMilestones, setActiveAssignmentMilestones] = useState<LearningMilestoneItem[]>([]);
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<number | null>(1);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [viewingCertificate, setViewingCertificate] = useState<any>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Forms
  const [programForm, setProgramForm] = useState({
    title: '',
    description: '',
    category: 'Full Stack Development',
    targetSkillId: '2',
    minProficiencyGain: '2',
    durationHours: '30',
    provider: 'OKGIP Engineering Academy',
  });

  const [assignForm, setAssignForm] = useState({
    trainingProgramId: '1',
    employeeId: '3',
    dueDate: '2026-09-30',
  });

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, aRes, rRes, eRes, sRes, vRes] = await Promise.all([
        api.get('/trainings'),
        api.get('/trainings/assignments'),
        api.get('/trainings/recommendations').catch(() => ({ data: { data: [] } })),
        api.get('/employees').catch(() => ({ data: { data: [] } })),
        api.get('/skills').catch(() => ({ data: { data: [] } })),
        api.get('/trainings/analytics/velocity').catch(() => ({ data: { data: null } })),
      ]);

      if (pRes.data?.success) setPrograms(pRes.data.data || []);
      if (aRes.data?.success) setAssignments(aRes.data.data || []);
      if (rRes.data?.success) setRecommendations(rRes.data.data || []);
      if (eRes.data?.success) setEmployees(eRes.data.data || []);
      if (sRes.data?.success) setSkills(sRes.data.data || []);
      if (vRes.data?.success) setVelocityData(vRes.data.data || null);
    } catch (err) {
      console.error('Error loading training programs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Self-Enrollment from Knowledge Gap Recommendation
  const handleSelfEnroll = async (rec: TrainingRecommendation) => {
    if (!rec.recommended_program) {
      addToast('error', 'No Program Available', 'There is no training program set up for this skill yet. Ask an Admin to add one.');
      return;
    }
    try {
      const res = await api.post('/trainings/enroll', {
        trainingProgramId: rec.recommended_program.id,
        reason: rec.reason,
      });
      if (res.data.success) {
        addToast('success', 'Enrolled Successfully! 🎓', `You are now enrolled in "${rec.recommended_program.title}".`);
        fetchData();
      }
    } catch (err: any) {
      addToast('error', 'Enrollment Failed', err.response?.data?.message || 'Could not enroll');
    }
  };

  // Manager Training Assignment
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/trainings/assign', assignForm);
      if (res.data.success) {
        addToast('success', 'Employee Enrolled', 'Training assignment created with target milestones.');
        setIsAssignModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      addToast('error', 'Assignment Failed', err.response?.data?.message || 'Already enrolled');
    }
  };

  // Create New Training Program
  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/trainings', programForm);
      if (res.data.success) {
        addToast('success', 'Training Program Created', programForm.title);
        setIsAddProgramModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      addToast('error', 'Creation Failed', err.response?.data?.message || 'Error');
    }
  };

  // Update Individual Module Progress (Recalculates Assignment Progress %)
  const handleUpdateModuleProgress = async (assignmentId: number, moduleId: number, newPercentage: number) => {
    try {
      const res = await api.put(`/trainings/assignments/${assignmentId}/modules/${moduleId}`, {
        progressPercentage: newPercentage,
      });
      if (res.data.success) {
        addToast('success', 'Module Progress Updated', res.data.message);
        fetchData();
      }
    } catch (err: any) {
      addToast('error', 'Update Failed');
    }
  };

  // Update Milestone Status (Triggers Post-Training Skill Upgrade when Completed)
  const handleToggleMilestone = async (
    assignmentId: number,
    milestoneId: number,
    currentStatus: 'Not Started' | 'In Progress' | 'Completed'
  ) => {
    const nextStatus =
      currentStatus === 'Completed'
        ? 'In Progress'
        : currentStatus === 'In Progress'
        ? 'Completed'
        : 'In Progress';

    try {
      const res = await api.put(`/trainings/assignments/${assignmentId}/milestones/${milestoneId}`, {
        status: nextStatus,
      });
      if (res.data.success) {
        addToast('success', 'Milestone Updated', `Milestone status set to "${nextStatus}".`);
        fetchData();
      }
    } catch (err: any) {
      addToast('error', 'Milestone Update Failed');
    }
  };

  // Certify Assignment (Issue Certificate & Skill Upgrade)
  const handleCertify = async (assignment: TrainingAssignment) => {
    try {
      const res = await api.put(`/trainings/assignments/${assignment.id}/certify`);
      if (res.data.success) {
        addToast('success', 'Certificate Issued! 🏆', res.data.message);
        setViewingCertificate(res.data.data?.certificate);
        setIsCertificateModalOpen(true);
        fetchData();
      }
    } catch (err: any) {
      addToast('error', 'Certification Failed');
    }
  };

  // Renew Expired Certification
  const handleRenew = async (assignment: TrainingAssignment) => {
    try {
      const res = await api.put(`/trainings/assignments/${assignment.id}/renew`);
      if (res.data.success) {
        addToast('success', 'Certification Renewed! 🔄', res.data.message);
        fetchData();
      }
    } catch (err: any) {
      addToast('error', 'Renewal Failed');
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Certified':
        return (
          <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 border border-purple-200 rounded-full font-bold text-[10px] flex items-center gap-1">
            <Award className="w-3 h-3 text-purple-600" />
            <span>Certified</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[10px] flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 border border-teal-200 rounded-full font-bold text-[10px] flex items-center gap-1">
            <Zap className="w-3 h-3 text-teal-600" />
            <span>In Progress</span>
          </span>
        );
      case 'Expired / Renewal':
        return (
          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-bold text-[10px] flex items-center gap-1">
            <RotateCw className="w-3 h-3 text-amber-600" />
            <span>Expired / Renewal</span>
          </span>
        );
      case 'Not Started':
      default:
        return (
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full font-bold text-[10px] flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Not Started</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-xs text-slate-800">
      <Toast toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Main Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#0A7A74]" />
            Training, Learning Milestones & Certification Management
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Track measurable course progress, complete modular learning milestones, and manage certification renewals
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setActiveTab('my_learning')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'my_learning'
                ? 'bg-white text-[#0A7A74] shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#0A7A74]" />
            <span>My Learning & Milestones</span>
            <span className="px-1.5 py-0.5 bg-teal-100 text-teal-800 rounded-full text-[10px] font-bold">
              {assignments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'catalog'
                ? 'bg-white text-[#0A7A74] shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Layers className="w-4 h-4 text-sky-600" />
            <span>Curriculum Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('velocity_analytics')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'velocity_analytics'
                ? 'bg-white text-[#0A7A74] shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span>Learning Velocity & Manager Visibility</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MY LEARNING & MEASURABLE PROGRESS                                  */}
      {/* ========================================================================= */}
      {activeTab === 'my_learning' && (
        <div className="space-y-6">
          {/* Skill-Gap Integrated Training Recommendations (Milestone 2 Integration) */}
          {recommendations.length > 0 && (
            <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/5 p-6 rounded-3xl border border-teal-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#0A7A74]" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Recommended Training for Your Skill Deficits (BASE 1 Matrix)
                    </h3>
                    <p className="text-slate-600 text-xs">
                      Targeted courses curated to bridge your active knowledge gaps
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-white text-[#0A7A74] border border-teal-200 rounded-xl font-bold text-[11px]">
                  {recommendations.length} Recommendations Found
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.gap_id}
                    className="bg-white p-4 rounded-2xl border border-teal-200/60 shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-md font-bold text-[10px]">
                          Target Skill: {rec.skill_name}
                        </span>
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md font-bold text-[10px]">
                          {rec.priority} Priority Gap
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs">
                        {rec.recommended_program?.title || 'No matching program yet'}
                      </h4>
                      <p className="text-slate-500 text-[11px] leading-relaxed">{rec.reason}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[11px] text-slate-600">
                        {rec.recommended_program ? (
                          <>
                            <span>{rec.recommended_program.duration_hours} Hours</span> •{' '}
                            <span>+{rec.recommended_program.min_proficiency_gain} Level Gain</span>
                          </>
                        ) : (
                          <span className="text-slate-400 italic">Ask an Admin to add a training program for this skill</span>
                        )}
                      </div>

                      {rec.is_enrolled ? (
                        <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Enrolled ({rec.enrollment_status})
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSelfEnroll(rec)}
                          disabled={!rec.recommended_program}
                          className="px-3 py-1.5 bg-[#0A7A74] hover:bg-[#08635e] text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Enroll Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active & Enrolled Training Programs List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0A7A74]" />
                Enrolled Courses & Measurable Progress Breakdown
              </h2>
              <span className="text-slate-500 text-[11px]">
                Showing {assignments.length} course assignments
              </span>
            </div>

            {assignments.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                <p>No training courses enrolled yet. Choose a recommended program above!</p>
              </div>
            ) : (
              <div className="space-y-5">
                {assignments.map((assignment) => {
                  const isExpanded = expandedAssignmentId === assignment.id;
                  const modules = assignment.modules || [];
                  const milestones = assignment.milestones || [];
                  const completedModules = modules.filter(
                    (m) => m.status === 'Completed' || m.progress_percentage === 100
                  );
                  const remainingModules = modules.filter(
                    (m) => m.status !== 'Completed' && m.progress_percentage < 100
                  );
                  const completedMilestones = milestones.filter((m) => m.status === 'Completed');

                  return (
                    <div
                      key={assignment.id}
                      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all hover:border-[#0A7A74]/40"
                    >
                      {/* Main Course Card Header */}
                      <div className="p-6 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-md font-bold text-[10px]">
                                {assignment.program_category || 'Technical'}
                              </span>
                              <span className="text-slate-500 text-[11px]">
                                Target Skill: <strong>{assignment.target_skill_name}</strong>
                              </span>
                              <span>•</span>
                              <span className="text-slate-500 text-[11px]">
                                Provider: <strong>{assignment.provider || 'OKGIP'}</strong>
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-slate-900">
                              {assignment.program_title}
                            </h3>
                            <p className="text-slate-500 text-xs">
                              {assignment.program_description}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-start">
                            {renderStatusBadge(assignment.status)}
                          </div>
                        </div>

                        {/* Measurable Progress Bar & Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50/90 rounded-2xl border border-slate-100">
                          {/* 1. Overall Progress */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-600">Course Progress</span>
                              <span className="text-[#0A7A74]">{assignment.progress_percentage}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#0A7A74] rounded-full transition-all duration-500"
                                style={{ width: `${assignment.progress_percentage}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              Calculated across modules & milestones
                            </span>
                          </div>

                          {/* 2. Modules Status */}
                          <div className="space-y-1">
                            <span className="text-slate-500 font-medium block text-[11px]">
                              Course Modules
                            </span>
                            <div className="text-xs font-bold text-slate-900">
                              <span className="text-emerald-700">{completedModules.length} Completed</span> /{' '}
                              <span className="text-amber-700">{remainingModules.length} Remaining</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              {modules.length} total interactive modules
                            </span>
                          </div>

                          {/* 3. Milestones Status */}
                          <div className="space-y-1">
                            <span className="text-slate-500 font-medium block text-[11px]">
                              Learning Milestones
                            </span>
                            <div className="text-xs font-bold text-slate-900">
                              <span className="text-emerald-700">{completedMilestones.length} Achieved</span> /{' '}
                              <span>{milestones.length} Total</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              Chunked skill milestones
                            </span>
                          </div>

                          {/* 4. Timeline Dates */}
                          <div className="space-y-1">
                            <span className="text-slate-500 font-medium block text-[11px]">
                              Timeline & Schedule
                            </span>
                            <div className="text-xs text-slate-800 font-semibold">
                              Start: {assignment.start_date || assignment.assigned_date}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Due: {assignment.expected_completion_date || assignment.due_date}
                              {assignment.actual_completion_date && (
                                <span className="text-emerald-700 font-bold block">
                                  Finished: {assignment.actual_completion_date}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions Toolbar & Expand Toggle */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <button
                            onClick={() =>
                              setExpandedAssignmentId(isExpanded ? null : assignment.id)
                            }
                            className="flex items-center gap-1.5 font-bold text-xs text-[#0A7A74] hover:text-[#08635e]"
                          >
                            <span>
                              {isExpanded
                                ? 'Hide Modular Modules & Milestones'
                                : 'Inspect & Update Modules / Milestones'}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>

                          <div className="flex items-center gap-2">
                            {/* Certify Button */}
                            {assignment.status !== 'Certified' &&
                              assignment.progress_percentage === 100 && (
                                <button
                                  onClick={() => handleCertify(assignment)}
                                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                                >
                                  <Award className="w-4 h-4" />
                                  <span>Issue Certificate & Verify Skill</span>
                                </button>
                              )}

                            {/* View Certificate */}
                            {assignment.status === 'Certified' && (
                              <button
                                onClick={() => {
                                  setViewingCertificate({
                                    cert_number:
                                      assignment.certificate_number || 'OKGIP-CERT-2026-88392',
                                    program_title: assignment.program_title,
                                    employee_name: assignment.employee_name,
                                    expiry_date:
                                      assignment.certificate_expiry_date || '2027-03-01',
                                    status: 'Valid',
                                  });
                                  setIsCertificateModalOpen(true);
                                }}
                                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl font-bold text-xs flex items-center gap-1.5"
                              >
                                <FileCheck className="w-4 h-4 text-purple-600" />
                                <span>View Official Certificate</span>
                              </button>
                            )}

                            {/* Renew Button */}
                            {assignment.status === 'Expired / Renewal' && (
                              <button
                                onClick={() => handleRenew(assignment)}
                                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
                              >
                                <RotateCw className="w-4 h-4" />
                                <span>Renew Certification (+1 Year)</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expandable Deep-Dive: Interactive Course Modules & Learning Milestones */}
                      {isExpanded && (
                        <div className="p-6 bg-slate-50/60 border-t border-slate-200/80 space-y-6">
                          {/* 1. Interactive Course Modules */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                                <Layers className="w-4 h-4 text-[#0A7A74]" />
                                Course Modules Breakdown (Interactive Progress)
                              </h4>
                              <span className="text-[11px] text-slate-500">
                                Click quick buttons or adjust sliders to update individual progress
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {modules.map((mod) => (
                                <div
                                  key={mod.id}
                                  className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <strong className="text-slate-900 font-bold text-xs">
                                      {mod.name}
                                    </strong>
                                    <span
                                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                        mod.progress_percentage === 100
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : mod.progress_percentage > 0
                                          ? 'bg-teal-100 text-teal-800'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {mod.progress_percentage}%
                                    </span>
                                  </div>

                                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${
                                        mod.progress_percentage === 100
                                          ? 'bg-emerald-500'
                                          : 'bg-[#0A7A74]'
                                      }`}
                                      style={{ width: `${mod.progress_percentage}%` }}
                                    />
                                  </div>

                                  {/* Fast action adjustment buttons */}
                                  <div className="flex items-center justify-between pt-1 gap-1">
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      Set:
                                    </span>
                                    <div className="flex items-center gap-1">
                                      {[0, 50, 80, 100].map((pct) => (
                                        <button
                                          key={pct}
                                          type="button"
                                          onClick={() =>
                                            handleUpdateModuleProgress(assignment.id, mod.id, pct)
                                          }
                                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                            mod.progress_percentage === pct
                                              ? 'bg-[#0A7A74] text-white'
                                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                          }`}
                                        >
                                          {pct}%
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 2. Learning Milestones (Chunked Progress Checkpoints) */}
                          <div className="space-y-3 pt-4 border-t border-slate-200/70">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                                <Target className="w-4 h-4 text-purple-600" />
                                Learning Milestones & Capstone Checkpoints
                              </h4>
                              <span className="text-[11px] text-slate-500">
                                Click milestone to toggle status & unlock post-training competency
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {milestones.map((milestone) => (
                                <div
                                  key={milestone.id}
                                  onClick={() =>
                                    handleToggleMilestone(
                                      assignment.id,
                                      milestone.id,
                                      milestone.status
                                    )
                                  }
                                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                                    milestone.status === 'Completed'
                                      ? 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-50'
                                      : milestone.status === 'In Progress'
                                      ? 'bg-teal-50/70 border-teal-200 hover:bg-teal-50'
                                      : 'bg-white border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                          milestone.status === 'Completed'
                                            ? 'bg-emerald-600 text-white'
                                            : milestone.status === 'In Progress'
                                            ? 'bg-teal-600 text-white'
                                            : 'bg-slate-200 text-slate-700'
                                        }`}
                                      >
                                        {milestone.id}
                                      </span>
                                      <strong className="font-bold text-slate-900 text-xs">
                                        {milestone.title}
                                      </strong>
                                    </div>
                                    <p className="text-slate-600 text-[11px]">
                                      {milestone.description}
                                    </p>
                                    {milestone.completion_date && (
                                      <span className="text-[10px] text-emerald-700 font-bold block">
                                        Completed on {milestone.completion_date}
                                      </span>
                                    )}
                                  </div>

                                  <div className="shrink-0">
                                    <span
                                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                                        milestone.status === 'Completed'
                                          ? 'bg-emerald-200 text-emerald-900'
                                          : milestone.status === 'In Progress'
                                          ? 'bg-teal-200 text-teal-900'
                                          : 'bg-slate-200 text-slate-800'
                                      }`}
                                    >
                                      {milestone.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TRAINING CURRICULUM CATALOG                                        */}
      {/* ========================================================================= */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Enterprise Training Programs & Curricula
              </h2>
              <p className="text-slate-500 text-xs">
                Comprehensive training programs mapped to verified skill taxonomy
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4 text-slate-600" />
                <span>Assign to Employee</span>
              </button>
              <button
                onClick={() => setIsAddProgramModalOpen(true)}
                className="px-4 py-2 bg-[#0A7A74] hover:bg-[#08635e] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create Program</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {programs.map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-md font-bold text-[10px]">
                      {program.category}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold text-[10px]">
                      +{program.min_proficiency_gain} Level Gain
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{program.title}</h3>
                  <p className="text-slate-500 text-xs line-clamp-2">{program.description}</p>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Target Skill:</span>
                      <strong className="font-bold text-slate-800">{program.target_skill_name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Provider:</span>
                      <strong className="font-bold text-slate-800">{program.provider}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Duration:</span>
                      <strong className="font-bold text-slate-800">{program.duration_hours} Hours</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">
                    {program.total_enrolled || 0} Enrolled
                  </span>
                  <button
                    onClick={() => {
                      setAssignForm({
                        trainingProgramId: String(program.id),
                        employeeId: '3',
                        dueDate: '2026-09-30',
                      });
                      setIsAssignModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-[#0A7A74] hover:bg-[#08635e] text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Assign Program</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LEARNING VELOCITY ANALYTICS & MANAGER VISIBILITY                   */}
      {/* ========================================================================= */}
      {activeTab === 'velocity_analytics' && (
        <div className="space-y-6">
          {/* Top Velocity KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-1">
              <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider block">
                Total Enrollments
              </span>
              <div className="text-2xl font-black text-slate-900">
                {velocityData?.metrics?.total_enrolled || assignments.length}
              </div>
              <span className="text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +14 modules completed this week
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-1">
              <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider block">
                Certified Completions
              </span>
              <div className="text-2xl font-black text-purple-700">
                {velocityData?.metrics?.certified_count || 1}
              </div>
              <span className="text-purple-600 text-[10px] font-bold">
                100% verified accreditations
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-1">
              <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider block">
                Average Learning Velocity
              </span>
              <div className="text-2xl font-black text-[#0A7A74]">
                {velocityData?.metrics?.average_completion_rate || 76}%
              </div>
              <span className="text-teal-700 text-[10px] font-bold">
                Across all active cohorts
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-1">
              <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider block">
                Avg Milestone Velocity
              </span>
              <div className="text-2xl font-black text-slate-900">12.5 Days</div>
              <span className="text-slate-400 text-[10px] font-medium">
                Per modular milestone chunk
              </span>
            </div>
          </div>

          {/* Department Velocity Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#0A7A74]" />
              Departmental Learning Velocity & Gap Closures
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Staff Count</th>
                    <th className="py-3 px-4">Active Enrollments</th>
                    <th className="py-3 px-4">Completion Progress</th>
                    <th className="py-3 px-4">Open Skill Gaps</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {velocityData?.department_breakdown?.map((dept: any) => (
                    <tr key={dept.department_id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {dept.department_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{dept.total_employees} members</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {dept.total_enrollments} courses
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#0A7A74] rounded-full"
                              style={{ width: `${dept.average_progress}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-700">{dept.average_progress}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-bold text-[10px]">
                          {dept.active_gaps} Gaps
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Manager Visibility Team Roster */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Team Member Progress & Competency Trajectory
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {velocityData?.team_members?.map((member: any) => (
                <div
                  key={member.employee_id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <strong className="font-bold text-slate-900 block text-xs">
                        {member.name}
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        {member.designation} • {member.department_name}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-900 font-bold rounded-md text-[10px]">
                      {member.active_courses_count} Active Courses
                    </span>
                  </div>

                  <div className="space-y-2">
                    {member.assignments?.map((asg: any) => (
                      <div
                        key={asg.id}
                        className="p-2.5 bg-white rounded-xl border border-slate-100 space-y-1"
                      >
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-slate-800 truncate">{asg.title}</span>
                          <span className="font-bold text-[#0A7A74]">
                            {asg.progress_percentage}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0A7A74]"
                            style={{ width: `${asg.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS SECTION                                                            */}
      {/* ========================================================================= */}

      {/* 1. Add Training Program Modal */}
      {isAddProgramModalOpen && (
        <Modal
          isOpen={isAddProgramModalOpen}
          onClose={() => setIsAddProgramModalOpen(false)}
          title="Create New Training Program"
        >
          <form onSubmit={handleCreateProgram} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Course Title *</label>
              <input
                type="text"
                value={programForm.title}
                onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                placeholder="e.g. Distributed Systems & Kafka Architecture"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={programForm.description}
                onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Skill</label>
                <select
                  value={programForm.targetSkillId}
                  onChange={(e) => setProgramForm({ ...programForm, targetSkillId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  {skills.map((sk) => (
                    <option key={sk.id} value={sk.id}>
                      {sk.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={programForm.category}
                  onChange={(e) => setProgramForm({ ...programForm, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Duration (Hours)</label>
                <input
                  type="number"
                  value={programForm.durationHours}
                  onChange={(e) => setProgramForm({ ...programForm, durationHours: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Proficiency Gain</label>
                <input
                  type="number"
                  value={programForm.minProficiencyGain}
                  onChange={(e) =>
                    setProgramForm({ ...programForm, minProficiencyGain: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddProgramModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0A7A74] hover:bg-[#08635e] text-white rounded-xl font-bold shadow-sm"
              >
                Create Program
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 2. Assign Training Modal */}
      {isAssignModalOpen && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title="Enroll & Assign Employee to Training"
        >
          <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Program</label>
              <select
                value={assignForm.trainingProgramId}
                onChange={(e) => setAssignForm({ ...assignForm, trainingProgramId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.duration_hours} hrs)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Assign to Employee</label>
              <select
                value={assignForm.employeeId}
                onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.designation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Expected Due Date</label>
              <input
                type="date"
                value={assignForm.dueDate}
                onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                required
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0A7A74] hover:bg-[#08635e] text-white rounded-xl font-bold shadow-sm"
              >
                Assign & Enforce Milestones
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 3. Certificate View Modal */}
      {isCertificateModalOpen && viewingCertificate && (
        <Modal
          isOpen={isCertificateModalOpen}
          onClose={() => setIsCertificateModalOpen(false)}
          title="Official Certificate of Completion"
        >
          <div className="space-y-4 text-center p-6 bg-gradient-to-b from-white to-slate-50 rounded-2xl border border-slate-200">
            <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0A7A74] block">
                OKGIP ENTERPRISE ENGINEERING ACADEMY
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-1">
                Certificate of Proficiency & Excellence
              </h2>
              <p className="text-slate-500 text-xs mt-1">This certifies that</p>
              <h3 className="text-base font-bold text-[#0A7A74] mt-1">
                {viewingCertificate.employee_name}
              </h3>
              <p className="text-slate-600 text-xs mt-2">
                has successfully fulfilled all curriculum requirements and learning milestones for
              </p>
              <strong className="text-slate-900 font-black text-sm block mt-1">
                {viewingCertificate.program_title}
              </strong>
            </div>

            <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
              <div>
                <span className="block text-[10px]">Certificate No:</span>
                <strong className="text-slate-800">{viewingCertificate.cert_number}</strong>
              </div>
              <div>
                <span className="block text-[10px]">Validity Period:</span>
                <strong className="text-emerald-700 font-bold">
                  Valid thru {viewingCertificate.expiry_date}
                </strong>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setIsCertificateModalOpen(false)}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
