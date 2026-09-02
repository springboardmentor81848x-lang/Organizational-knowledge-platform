import React, { useState, useEffect } from 'react';
import {
  Users,
  BrainCircuit,
  Sparkles,
  Calendar,
  Clock,
  Video,
  Plus,
  Search,
  Star,
  CheckCircle2,
  XCircle,
  Award,
  MessageSquare,
  ChevronRight,
  Filter,
  Layers,
  ArrowRight,
  UserCheck,
  TrendingUp,
  BookOpen,
  Info,
  Send,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  User,
  Clock3,
  CalendarDays,
  Target,
  Edit3,
  Trash2,
  Radio,
  ThumbsUp,
  MapPin,
  Share2,
  History,
  ShieldAlert,
  HelpCircle,
  ArrowUpRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Toast, ToastMessage } from '../components/Toast';
import { Modal } from '../components/Modal';
import { KnowledgeSession, ExpertItem, MentorshipMatch, Skill, MentorRequestItem, MentorRequestHistoryItem } from '../types';

export const MentorshipHub: React.FC = () => {
  const { user } = useAuth();
  
  // Specific role detection for governance & permissions
  const isHR = ['HR Specialist', 'HR', 'ROLE_HR'].includes(user?.role || '');
  const isSystemAdmin = ['Admin', 'System Administrator', 'ROLE_ADMIN'].includes(user?.role || '');
  const isMentor = ['L&D Admin / Mentor', 'Mentor', 'ROLE_MENTOR', 'L&D Admin'].includes(user?.role || '');
  const isGovernanceAdmin = isHR || isSystemAdmin;
  const canApprove = isHR || isSystemAdmin || isMentor;
  const isEmployee = !isGovernanceAdmin && !isMentor;

  const [mainTab, setMainTab] = useState<'mentorship' | 'sessions' | 'experts'>('mentorship');

  // Module 1 (Mentorship) State
  const [activeSubTab, setActiveSubTab] = useState<string>(
    isGovernanceAdmin ? 'admin_governance' : isMentor ? 'received_requests' : 'recommendations'
  );
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [recommendations, setRecommendations] = useState<MentorshipMatch[]>([]);
  const [targetEmployee, setTargetEmployee] = useState<any>(null);
  const [sentRequests, setSentRequests] = useState<MentorRequestItem[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<MentorRequestItem[]>([]);
  const [activeMentorships, setActiveMentorships] = useState<MentorRequestItem[]>([]);
  const [adminAllRequests, setAdminAllRequests] = useState<MentorRequestItem[]>([]);
  const [adminStats, setAdminStats] = useState({ total: 0, pending: 0, recommended: 0, approved: 0, rejected: 0 });
  const [adminStatusFilter, setAdminStatusFilter] = useState<'ALL' | 'PENDING' | 'RECOMMENDED' | 'APPROVED' | 'REJECTED'>('ALL');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [skillsList, setSkillsList] = useState<Skill[]>([]);

  // Request Modal State (Employee submits request)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestForm, setRequestForm] = useState({
    skillId: '2',
    goal: 'Accelerate proficiency to close target competency gap',
  });

  // Admin / Mentor Governance Decision Modal
  const [isAdminDecisionModalOpen, setIsAdminDecisionModalOpen] = useState(false);
  const [selectedAdminRequest, setSelectedAdminRequest] = useState<MentorRequestItem | null>(null);
  const [adminDecisionTab, setAdminDecisionTab] = useState<'approve' | 'recommend' | 'reject'>('approve');
  const [adminActionSubmitting, setAdminActionSubmitting] = useState(false);
  const [adminDecisionForm, setAdminDecisionForm] = useState({
    selectedMentorId: '',
    adminNotes: '',
    rejectionReason: '',
  });

  // Audit History Modal
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyRequest, setHistoryRequest] = useState<MentorRequestItem | null>(null);
  const [historyList, setHistoryList] = useState<MentorRequestHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Mentorship Completion / Feedback Modal
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackMentorshipId, setFeedbackMentorshipId] = useState<number | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');

  // ----------------------------------------------------
  // Module 2 (Knowledge-Sharing Sessions) State
  // ----------------------------------------------------
  const [sessions, setSessions] = useState<KnowledgeSession[]>([]);
  const [sessionFilter, setSessionFilter] = useState<'ALL' | 'SCHEDULED' | 'COMPLETED' | 'MY_REGISTERED'>('ALL');
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] = useState(false);
  const [isEditSessionModalOpen, setIsEditSessionModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<KnowledgeSession | null>(null);

  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    hostMentorId: '2',
    skillId: '2',
    sessionDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().slice(0, 16),
    durationMinutes: '60',
    maxCapacity: '20',
    meetingLink: 'https://meet.google.com/okgip-knowledge-hub',
    location: 'Virtual / Google Meet',
  });

  // Session Attendance Modal
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceSession, setAttendanceSession] = useState<KnowledgeSession | null>(null);

  // Session Feedback Modal
  const [isSessionFeedbackModalOpen, setIsSessionFeedbackModalOpen] = useState(false);
  const [sessionFeedbackTarget, setSessionFeedbackTarget] = useState<KnowledgeSession | null>(null);
  const [sessionFeedbackRating, setSessionFeedbackRating] = useState(5);
  const [sessionFeedbackComment, setSessionFeedbackComment] = useState('');

  // ----------------------------------------------------
  // Module 3 (Internal Expert Directory) State
  // ----------------------------------------------------
  const [experts, setExperts] = useState<ExpertItem[]>([]);
  const [expertSearchQuery, setExpertSearchQuery] = useState('');
  const [expertDeptFilter, setExpertDeptFilter] = useState('All');
  const [expertProficiencyFilter, setExpertProficiencyFilter] = useState('All');
  const [expertProfileModalOpen, setIsExpertProfileModalOpen] = useState(false);
  const [selectedExpertProfile, setSelectedExpertProfile] = useState<ExpertItem | null>(null);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [recRes, sentRes, recvRes, actRes, sessRes, expRes, skRes, adminRes] = await Promise.all([
        api.get('/mentorships/recommendations').catch(() => ({ data: { data: [] } })),
        api.get('/mentorships/sent').catch(() => ({ data: { data: [] } })),
        api.get('/mentorships/received').catch(() => ({ data: { data: [] } })),
        api.get('/mentorships/active').catch(() => ({ data: { data: [] } })),
        api.get('/sessions').catch(() => ({ data: { data: [] } })),
        api.get('/search/experts').catch(() => ({ data: { data: [] } })),
        api.get('/skills').catch(() => ({ data: { data: [] } })),
        (isGovernanceAdmin || isMentor) ? api.get('/mentorships/admin/requests').catch(() => ({ data: { data: [], stats: null } })) : Promise.resolve({ data: { data: [] } }),
      ]);

      if (recRes.data?.success) {
        setRecommendations(recRes.data.data || []);
        if (recRes.data.targetEmployee) setTargetEmployee(recRes.data.targetEmployee);
      }
      if (sentRes.data?.success) setSentRequests(sentRes.data.data || []);
      if (recvRes.data?.success) setReceivedRequests(recvRes.data.data || []);
      if (actRes.data?.success) setActiveMentorships(actRes.data.data || []);
      if (sessRes.data?.success) setSessions(sessRes.data.data || []);
      if (expRes.data?.success) setExperts(expRes.data.data || []);
      if (skRes.data?.data) setSkillsList(skRes.data.data);
      if (adminRes.data?.success) {
        setAdminAllRequests(adminRes.data.data || []);
        if (adminRes.data.stats) setAdminStats(adminRes.data.stats);
      }
    } catch (err: any) {
      console.error('Error loading mentorship hub data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveSubTab(isGovernanceAdmin ? 'admin_governance' : isMentor ? 'received_requests' : 'recommendations');
    fetchAllData();
  }, [user]);

  // Mentorship Request Handlers (Employee Submits)
  const handleOpenRequestModal = (mentor: any) => {
    setSelectedMentor(mentor);
    const targetSkillId = mentor.matchingSkill?.id || mentor.skill_id || mentor.skillId || '2';
    const skillName = mentor.matchingSkill?.name || mentor.skill_name || mentor.skillName || 'Engineering & Architecture';
    setRequestForm({
      skillId: String(targetSkillId),
      goal: `Elevate proficiency in ${skillName} from Level ${mentor.menteeCurrentLevel || mentor.current_proficiency || 1} to Level ${mentor.requiredLevel || 4}`,
    });
    setIsRequestModalOpen(true);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;
    try {
      setRequestSubmitting(true);
      const mentorId = selectedMentor.mentorId || selectedMentor.mentor_id || selectedMentor.employee_id;
      const res = await api.post('/mentorships/request', {
        mentorId,
        skillId: requestForm.skillId,
        goal: requestForm.goal,
      });

      if (res.data.success) {
        addToast(
          'success',
          'Mentor Request Submitted! 📋',
          `Your request has been forwarded to Admin / HR for review and official assignment.`
        );
        setIsRequestModalOpen(false);
        setActiveSubTab('sent_requests');
        fetchAllData();
      }
    } catch (err: any) {
      addToast('error', 'Request Failed', err.response?.data?.message || 'Could not send mentorship request');
    } finally {
      setRequestSubmitting(false);
    }
  };

  // Admin / Mentor Decision Handlers
  const handleOpenAdminDecisionModal = (req: MentorRequestItem) => {
    setSelectedAdminRequest(req);
    setAdminDecisionTab('approve');
    setAdminDecisionForm({
      selectedMentorId: String(req.recommended_mentor_id || req.requested_mentor_id || req.mentor_id || ''),
      adminNotes: req.admin_notes || '',
      rejectionReason: '',
    });
    setIsAdminDecisionModalOpen(true);
  };

  const handleAdminApprove = async () => {
    if (!selectedAdminRequest) return;
    try {
      setAdminActionSubmitting(true);
      const res = await api.post(`/mentorships/${selectedAdminRequest.id}/approve`, {
        assignedMentorId: adminDecisionForm.selectedMentorId,
        adminNotes: adminDecisionForm.adminNotes,
      });
      if (res.data.success) {
        addToast('success', 'Mentorship Approved & Assigned! 🟢', res.data.message);
        setIsAdminDecisionModalOpen(false);
        fetchAllData();
      }
    } catch (err: any) {
      addToast('error', 'Approval Failed', err.response?.data?.message || 'Unauthorized or server error');
    } finally {
      setAdminActionSubmitting(false);
    }
  };

  const handleAdminRecommend = async () => {
    if (!selectedAdminRequest) return;
    if (!adminDecisionForm.selectedMentorId) {
      addToast('error', 'Selection Required', 'Please select an expert mentor to recommend.');
      return;
    }
    try {
      setAdminActionSubmitting(true);
      const res = await api.post(`/mentorships/${selectedAdminRequest.id}/recommend`, {
        recommendedMentorId: adminDecisionForm.selectedMentorId,
        adminNotes: adminDecisionForm.adminNotes,
      });
      if (res.data.success) {
        addToast('success', 'Mentor Recommended by Admin! 💡', res.data.message);
        setIsAdminDecisionModalOpen(false);
        fetchAllData();
      }
    } catch (err: any) {
      addToast('error', 'Recommendation Failed', err.response?.data?.message || 'Error recording recommendation');
    } finally {
      setAdminActionSubmitting(false);
    }
  };

  const handleAdminReject = async () => {
    if (!selectedAdminRequest) return;
    if (!adminDecisionForm.rejectionReason.trim()) {
      addToast('error', 'Reason Required', 'Please enter a clear explanation for rejecting the request.');
      return;
    }
    try {
      setAdminActionSubmitting(true);
      const res = await api.post(`/mentorships/${selectedAdminRequest.id}/reject`, {
        rejectionReason: adminDecisionForm.rejectionReason,
        adminNotes: adminDecisionForm.adminNotes,
      });
      if (res.data.success) {
        addToast('info', 'Request Rejected', 'The requesting employee has been notified with the provided reason.');
        setIsAdminDecisionModalOpen(false);
        fetchAllData();
      }
    } catch (err: any) {
      addToast('error', 'Rejection Failed', err.response?.data?.message || 'Error rejecting request');
    } finally {
      setAdminActionSubmitting(false);
    }
  };

  // View Audit History Modal
  const handleOpenHistoryModal = async (req: MentorRequestItem) => {
    setHistoryRequest(req);
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/mentorships/${req.id}/history`);
      if (res.data.success) {
        setHistoryList(res.data.data || []);
      } else {
        setHistoryList(req.history || []);
      }
    } catch (err) {
      setHistoryList(req.history || []);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCompleteMentorship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMentorshipId) return;
    try {
      const res = await api.put(`/mentorships/${feedbackMentorshipId}/complete`, {
        rating: feedbackRating,
        feedback: feedbackComments,
      });
      if (res.data.success) {
        addToast('success', 'Mentorship Completed! ⭐', 'Rating submitted and skills logged.');
        setIsFeedbackModalOpen(false);
        fetchAllData();
      }
    } catch (err: any) {
      addToast('error', 'Action Failed', err.response?.data?.message || 'Error completing mentorship');
    }
  };

  // ----------------------------------------------------
  // Module 2 (Knowledge-Sharing Sessions) Handlers
  // ----------------------------------------------------
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/sessions', sessionForm);
      if (res.data.success) {
        addToast('success', 'Session Scheduled! 🗓️', `"${sessionForm.title}" is now open for employee registration.`);
        setIsCreateSessionModalOpen(false);
        fetchAllData();
      }
    } catch (err: any) {
      addToast('error', 'Creation Failed', err.response?.data?.message || 'Could not create session');
    }
  };

  const handleEditSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;
    try {
      const res = await api.put(`/sessions/${selectedSession.id}`, sessionForm);
      if (res.data.success) {
        addToast('success', 'Session Updated! ✏️', `"${sessionForm.title}" details updated.`);
        setIsEditSessionModalOpen(false);
        fetchAllData();
      }
    } catch (err: any) {
      addToast('error', 'Update Failed', err.response?.data?.message || 'Could not update session');
    }
  };

  const handleCancelSession = async (session: KnowledgeSession) => {
    if (!window.confirm(`Are you sure you want to cancel "${session.title}"? Registered participants will be notified.`)) return;
    try {
      const res = await api.put(`/sessions/${session.id}/cancel`);
      if (res.data.success) {
        addToast('info', 'Session Cancelled ⚠️', 'Attendees have been notified via alert.');
        fetchAllData();
      }
    } catch (err: any) {
      addToast('error', 'Cancellation Failed', err.response?.data?.message || 'Error');
    }
  };

  const handleRegisterSession = async (session: KnowledgeSession) => {
    try {
      const res = await api.post(`/sessions/${session.id}/register`, {});
      if (res.data.success) {
        addToast('success', 'Registration Confirmed! 🎉', `Seat reserved for "${session.title}".`);
        fetchAllData();
      }
    } catch (err: any) {
      addToast('error', 'Registration Failed', err.response?.data?.message || 'Could not register');
    }
  };

  const handleCancelRegistration = async (session: KnowledgeSession) => {
    try {
      const res = await api.post(`/sessions/${session.id}/cancel-registration`, {});
      if (res.data.success) {
        addToast('info', 'Registration Cancelled', `Your reservation for "${session.title}" has been released.`);
        fetchAllData();
      }
    } catch (err: any) {
      addToast('error', 'Action Failed', err.response?.data?.message || 'Error');
    }
  };

  const handleCompleteSession = async (session: KnowledgeSession) => {
    try {
      const res = await api.put(`/sessions/${session.id}/complete`);
      if (res.data.success) {
        addToast('success', 'Session Marked Completed! 🎓', 'Attendees notified to submit ratings & feedback.');
        fetchAllData();
      }
    } catch (err: any) {
      addToast('error', 'Action Failed');
    }
  };

  const handleRecordAttendance = async (sessionId: number, employeeId: number, attendanceStatus: 'ATTENDED' | 'ABSENT' | 'EXCUSED') => {
    try {
      const res = await api.put(`/sessions/${sessionId}/attendance`, {
        employeeId,
        attendanceStatus,
      });
      if (res.data.success) {
        addToast('success', 'Attendance Recorded', `Status updated to ${attendanceStatus}.`);
        fetchAllData();
      }
    } catch (err: any) {
      addToast('error', 'Attendance Failed');
    }
  };

  const handleSubmitSessionFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionFeedbackTarget) return;
    try {
      const res = await api.post(`/sessions/${sessionFeedbackTarget.id}/feedback`, {
        rating: sessionFeedbackRating,
        feedback: sessionFeedbackComment,
      });
      if (res.data.success) {
        addToast('success', 'Feedback Submitted! ⭐', `Session effectiveness recalculated.`);
        setIsSessionFeedbackModalOpen(false);
        fetchAllData();
      }
    } catch (err: any) {
      addToast('error', 'Submission Failed');
    }
  };

  // Filtered Sessions
  const filteredSessions = sessions.filter((s) => {
    if (sessionFilter === 'SCHEDULED') return s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS';
    if (sessionFilter === 'COMPLETED') return s.status === 'COMPLETED';
    if (sessionFilter === 'MY_REGISTERED') return s.is_user_registered;
    return true;
  });

  // Filtered Admin Requests
  const filteredAdminRequests = adminAllRequests.filter((req) => {
    if (adminStatusFilter === 'PENDING') {
      if (req.status !== 'Pending Admin Review' && req.status !== 'PENDING_ADMIN_APPROVAL') return false;
    } else if (adminStatusFilter === 'RECOMMENDED') {
      if (req.status !== 'Mentor Recommended' && req.status !== 'MENTOR_RECOMMENDED') return false;
    } else if (adminStatusFilter === 'APPROVED') {
      if (req.status !== 'Approved' && req.status !== 'Active') return false;
    } else if (adminStatusFilter === 'REJECTED') {
      if (req.status !== 'Rejected') return false;
    }

    if (adminSearchQuery) {
      const q = adminSearchQuery.toLowerCase();
      const match =
        (req.mentee_name && req.mentee_name.toLowerCase().includes(q)) ||
        (req.requested_mentor_name && req.requested_mentor_name.toLowerCase().includes(q)) ||
        (req.recommended_mentor_name && req.recommended_mentor_name.toLowerCase().includes(q)) ||
        (req.skill_name && req.skill_name.toLowerCase().includes(q)) ||
        (req.goal && req.goal.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Filtered Experts (Module 3)
  const filteredExperts = experts.filter((exp) => {
    if (expertSearchQuery) {
      const q = expertSearchQuery.toLowerCase();
      const match =
        exp.expert_name.toLowerCase().includes(q) ||
        exp.skill_name.toLowerCase().includes(q) ||
        exp.department_name.toLowerCase().includes(q) ||
        exp.designation.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (expertDeptFilter !== 'All' && exp.department_name !== expertDeptFilter) {
      return false;
    }
    if (expertProficiencyFilter !== 'All' && exp.proficiency !== expertProficiencyFilter) {
      return false;
    }
    return true;
  });

  const uniqueExpertDepts = ['All', ...Array.from(new Set(experts.map((e) => e.department_name)))];

  // Helper for Status Badges
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending Admin Review':
      case 'PENDING_ADMIN_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold text-[10px]">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Admin Review
          </span>
        );
      case 'Mentor Recommended':
      case 'MENTOR_RECOMMENDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-full font-bold text-[10px]">
            <Sparkles className="w-3 h-3 text-sky-600" />
            Mentor Recommended
          </span>
        );
      case 'Approved':
      case 'APPROVED':
      case 'Active':
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[10px]">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Approved & Assigned
          </span>
        );
      case 'Rejected':
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-full font-bold text-[10px]">
            <XCircle className="w-3 h-3 text-rose-600" />
            Rejected by Admin
          </span>
        );
      case 'Completed':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-full font-bold text-[10px]">
            <Award className="w-3 h-3 text-purple-600" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-bold text-[10px]">
            {status}
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
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0A7A74]" />
              Knowledge Sharing, Peer Mentorship & Expert Network
            </h1>
            {isGovernanceAdmin && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-200 rounded-md font-bold text-[10px]">
                HR / Admin Governance Mode
              </span>
            )}
            {isMentor && !isGovernanceAdmin && (
              <span className="px-2 py-0.5 bg-teal-100 text-teal-800 border border-teal-200 rounded-md font-bold text-[10px]">
                Mentor Review Mode
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Strict Admin-Governed Mentorship Matching, Interactive Workshops, and Organization-wide Expert Directory
          </p>
        </div>

        {/* Top-Level Module Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setMainTab('mentorship')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              mainTab === 'mentorship'
                ? 'bg-white text-[#0A7A74] shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <BrainCircuit className="w-4 h-4 text-[#0A7A74]" />
            <span>1-on-1 Mentorship</span>
            {canApprove && adminStats.pending > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-400 text-slate-900 rounded-full text-[10px] font-black animate-pulse">
                {adminStats.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setMainTab('sessions')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              mainTab === 'sessions'
                ? 'bg-white text-[#0A7A74] shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Video className="w-4 h-4 text-emerald-600" />
            <span>Knowledge Sessions</span>
            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
              {sessions.filter((s) => s.status === 'SCHEDULED').length}
            </span>
          </button>
          <button
            onClick={() => setMainTab('experts')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              mainTab === 'experts'
                ? 'bg-white text-[#0A7A74] shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Search className="w-4 h-4 text-sky-600" />
            <span>Expert Directory</span>
            <span className="px-1.5 py-0.5 bg-sky-100 text-sky-800 rounded-full text-[10px] font-bold">
              {experts.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODULE 1: 1-ON-1 PEER MENTORSHIP (Strict Admin-Governed Workflow)           */}
      {/* ========================================================================= */}
      {mainTab === 'mentorship' && (
        <div className="space-y-6">
          {/* Subtabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              {/* HR & System Admin Governance Subtab */}
              {isGovernanceAdmin && (
                <button
                  onClick={() => setActiveSubTab('admin_governance')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                    activeSubTab === 'admin_governance'
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>HR & Admin Governance</span>
                  {adminStats.pending > 0 && (
                    <span className="px-1.5 py-0.2 bg-amber-400 text-slate-900 rounded-full text-[10px] font-extrabold">
                      {adminStats.pending} Pending
                    </span>
                  )}
                </button>
              )}

              {/* Mentor Reviews & Approvals Subtab */}
              {isMentor && (
                <button
                  onClick={() => setActiveSubTab('received_requests')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                    activeSubTab === 'received_requests'
                      ? 'bg-[#0A7A74] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Clock3 className="w-3.5 h-3.5" />
                  <span>Incoming Requests & Approvals</span>
                  {receivedRequests.length > 0 && (
                    <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded-full text-[10px] font-bold">
                      {receivedRequests.length}
                    </span>
                  )}
                </button>
              )}

              {/* Employee Sent Requests Subtab */}
              {isEmployee && (
                <button
                  onClick={() => setActiveSubTab('sent_requests')}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                    activeSubTab === 'sent_requests'
                      ? 'bg-[#0A7A74] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>My Mentorship Requests</span>
                  <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded-full text-[10px]">
                    {sentRequests.length}
                  </span>
                </button>
              )}

              {/* Recommendations Subtab */}
              <button
                onClick={() => setActiveSubTab('recommendations')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                  activeSubTab === 'recommendations'
                    ? 'bg-[#0A7A74] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isMentor ? 'Mentees Seeking Guidance' : 'Skill-Gap Recommendations'}</span>
                <span className="px-1.5 py-0.2 bg-white/20 text-white rounded-full text-[10px]">
                  {recommendations.length}
                </span>
              </button>

              {/* Active Mentorships Subtab */}
              <button
                onClick={() => setActiveSubTab('active_pairings')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                  activeSubTab === 'active_pairings'
                    ? 'bg-[#0A7A74] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{isMentor ? 'My Active Mentees' : isGovernanceAdmin ? 'All Active Mentorships' : 'My Active Mentorships'}</span>
                <span className="px-1.5 py-0.2 bg-white/20 text-white rounded-full text-[10px]">
                  {activeMentorships.length}
                </span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{isGovernanceAdmin ? 'HR & Admin Governance Active' : isMentor ? 'Mentor Approval Authority Active' : 'Mentee Learning Portal'}</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SUBTAB: ADMIN GOVERNANCE & APPROVAL DASHBOARD                             */}
          {/* ========================================================================= */}
          {activeSubTab === 'admin_governance' && isGovernanceAdmin && (
            <div className="space-y-6">
              {/* Top KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-[11px] font-semibold">Total Requests</span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{adminStats.total}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>

                <div
                  onClick={() => setAdminStatusFilter('PENDING')}
                  className={`bg-white p-4 rounded-2xl border cursor-pointer transition-all shadow-sm flex items-center justify-between ${
                    adminStatusFilter === 'PENDING' ? 'border-amber-500 ring-2 ring-amber-200' : 'border-amber-200 hover:border-amber-300'
                  }`}
                >
                  <div>
                    <span className="text-amber-700 text-[11px] font-bold">Pending Admin Review</span>
                    <h3 className="text-xl font-extrabold text-amber-900 mt-0.5">{adminStats.pending}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                <div
                  onClick={() => setAdminStatusFilter('RECOMMENDED')}
                  className={`bg-white p-4 rounded-2xl border cursor-pointer transition-all shadow-sm flex items-center justify-between ${
                    adminStatusFilter === 'RECOMMENDED' ? 'border-sky-500 ring-2 ring-sky-200' : 'border-sky-200 hover:border-sky-300'
                  }`}
                >
                  <div>
                    <span className="text-sky-700 text-[11px] font-bold">Mentor Recommended</span>
                    <h3 className="text-xl font-extrabold text-sky-900 mt-0.5">{adminStats.recommended}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>

                <div
                  onClick={() => setAdminStatusFilter('APPROVED')}
                  className={`bg-white p-4 rounded-2xl border cursor-pointer transition-all shadow-sm flex items-center justify-between ${
                    adminStatusFilter === 'APPROVED' ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-emerald-200 hover:border-emerald-300'
                  }`}
                >
                  <div>
                    <span className="text-emerald-700 text-[11px] font-bold">Approved & Assigned</span>
                    <h3 className="text-xl font-extrabold text-emerald-900 mt-0.5">{adminStats.approved}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div
                  onClick={() => setAdminStatusFilter('REJECTED')}
                  className={`bg-white p-4 rounded-2xl border cursor-pointer transition-all shadow-sm flex items-center justify-between ${
                    adminStatusFilter === 'REJECTED' ? 'border-rose-500 ring-2 ring-rose-200' : 'border-rose-200 hover:border-rose-300'
                  }`}
                >
                  <div>
                    <span className="text-rose-700 text-[11px] font-bold">Rejected Requests</span>
                    <h3 className="text-xl font-extrabold text-rose-900 mt-0.5">{adminStats.rejected}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                    <XCircle className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Policy & Governance Notice */}
              <div className="p-4 bg-purple-50/70 border border-purple-200/90 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-purple-950">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs">Admin-Only Mentorship Authority Enforced</h4>
                    <p className="text-[11px] text-purple-800 mt-0.5">
                      Employees can submit mentor requests, and mentors provide coaching. Only authorized Admin / HR users have the power to recommend mentors, confirm official assignments, or reject requests with audit logging.
                    </p>
                  </div>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {(['ALL', 'PENDING', 'RECOMMENDED', 'APPROVED', 'REJECTED'] as const).map((filterKey) => (
                    <button
                      key={filterKey}
                      onClick={() => setAdminStatusFilter(filterKey)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                        adminStatusFilter === filterKey
                          ? 'bg-purple-700 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {filterKey === 'ALL' && `All (${adminAllRequests.length})`}
                      {filterKey === 'PENDING' && `Pending Review (${adminStats.pending})`}
                      {filterKey === 'RECOMMENDED' && `Recommended (${adminStats.recommended})`}
                      {filterKey === 'APPROVED' && `Approved (${adminStats.approved})`}
                      {filterKey === 'REJECTED' && `Rejected (${adminStats.rejected})`}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    placeholder="Search by mentee, mentor, skill..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              {/* Admin Requests Table */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/90 border-b border-slate-200/80 text-slate-600 font-bold">
                        <th className="py-3.5 px-5">Request Code</th>
                        <th className="py-3.5 px-4">Mentee (Requester)</th>
                        <th className="py-3.5 px-4">Skill Domain</th>
                        <th className="py-3.5 px-4">Proposed / Assigned Mentor</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Requested Date</th>
                        <th className="py-3.5 px-5 text-right">Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAdminRequests.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            No mentorship requests found matching the selected filter.
                          </td>
                        </tr>
                      ) : (
                        filteredAdminRequests.map((req) => {
                          const isPending = req.status === 'Pending Admin Review' || req.status === 'PENDING_ADMIN_APPROVAL';
                          const isRecommended = req.status === 'Mentor Recommended' || req.status === 'MENTOR_RECOMMENDED';

                          return (
                            <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-5 font-mono font-bold text-slate-700">
                                MNT-{String(req.id).padStart(5, '0')}
                              </td>

                              <td className="py-3.5 px-4">
                                <strong className="text-slate-900 font-bold block">{req.mentee_name}</strong>
                                <span className="text-[11px] text-slate-500">
                                  {req.mentee_designation} • {req.mentee_department}
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-bold text-[11px]">
                                  {req.skill_name}
                                </span>
                                <span className="block text-[10px] text-slate-400 mt-0.5">Gap Score: {req.gap_score || 2}</span>
                              </td>

                              <td className="py-3.5 px-4">
                                <div>
                                  {req.assigned_mentor_name ? (
                                    <div>
                                      <strong className="text-emerald-800 font-bold block flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        {req.assigned_mentor_name} (Assigned)
                                      </strong>
                                      <span className="text-[10px] text-slate-500">{req.mentor_designation}</span>
                                    </div>
                                  ) : req.recommended_mentor_name ? (
                                    <div>
                                      <strong className="text-sky-800 font-bold block flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-sky-600" />
                                        {req.recommended_mentor_name} (Recommended)
                                      </strong>
                                      <span className="text-[10px] text-slate-500">
                                        Original: {req.requested_mentor_name}
                                      </span>
                                    </div>
                                  ) : (
                                    <div>
                                      <strong className="text-slate-800 font-bold block">
                                        {req.requested_mentor_name || 'Proposed Mentor'}
                                      </strong>
                                      <span className="text-[10px] text-slate-500">{req.requested_mentor_designation}</span>
                                    </div>
                                  )}
                                </div>
                              </td>

                              <td className="py-3.5 px-4">{renderStatusBadge(req.status)}</td>

                              <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                                {new Date(req.requested_at || req.created_at).toLocaleDateString()}
                              </td>

                              <td className="py-3.5 px-5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenHistoryModal(req)}
                                    title="View Audit Trail"
                                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs"
                                  >
                                    <History className="w-4 h-4" />
                                  </button>

                                  {(isPending || isRecommended) ? (
                                    <button
                                      onClick={() => handleOpenAdminDecisionModal(req)}
                                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                                    >
                                      <span>Review & Decide</span>
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleOpenAdminDecisionModal(req)}
                                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                                    >
                                      Details
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBTAB: AI SKILL-GAP RECOMMENDATIONS                                      */}
          {/* ========================================================================= */}
          {activeSubTab === 'recommendations' && (
            <div className="space-y-4">
              {targetEmployee && (
                <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-teal-950 text-xs flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#0A7A74]" />
                      Skill Gap Matching for: {targetEmployee.name} ({targetEmployee.designation})
                    </h3>
                    <p className="text-teal-800 text-[11px] mt-0.5">
                      Knowledge Gap Deficits Detected: <strong className="font-bold">{targetEmployee.gapsCount}</strong> • Expert Mentors Available
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-white text-teal-900 border border-teal-200 rounded-xl font-bold text-[11px]">
                      {recommendations.length} Matching Expert Mentors
                    </span>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
                  <div className="w-6 h-6 border-2 border-[#0A7A74] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Calculating optimal peer mentor alignments...
                </div>
              ) : recommendations.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <h3 className="font-bold text-slate-900 text-sm">No Active Skill Deficits Detected</h3>
                  <p className="text-xs max-w-md mx-auto">
                    You currently meet all required benchmark competencies for your target role or have existing active mentorship pairings.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#0A7A74]/50 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-[#E6F7F5] text-[#0A7A74] border border-teal-200/80 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                              {rec.photo_url ? (
                                <img
                                  src={rec.photo_url}
                                  alt={rec.mentor_name}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/default-avatar.svg';
                                  }}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                (rec.mentor_name || rec.name || 'S').charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold text-[10px]">
                                {rec.skill_name}
                              </span>
                              <h3 className="text-sm font-bold text-slate-900 mt-1">{rec.mentor_name || rec.name || 'Senior Expert Mentor'}</h3>
                              <p className="text-slate-500 text-[11px]">{rec.mentor_designation || rec.designation || 'Technical Specialist'} • {rec.department_name || rec.department || 'Engineering'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-xs">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {rec.rating || 5.0}
                            </span>
                          </div>
                        </div>

                        {/* Skill Proficiency Compare */}
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Your Current Level:</span>
                            <span className="font-bold text-slate-700">L{rec.mentee_proficiency}/5</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Mentor Proficiency:</span>
                            <span className="font-bold text-[#0A7A74]">Level {rec.mentor_proficiency}/5 (Expert)</span>
                          </div>
                          <div className="flex justify-between text-[11px] pt-1 border-t border-slate-200/60 font-semibold text-emerald-700">
                            <span>Potential Competency Gain:</span>
                            <span>+{rec.proficiency_gap_gain} Levels</span>
                          </div>
                        </div>

                        {/* Match Reasons */}
                        <div className="space-y-1">
                          {(rec.match_reasons || []).slice(0, 2).map((reason: any, rIdx: number) => (
                            <div key={rIdx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-400">
                          {rec.completed_mentorships} Mentees Guided
                        </span>
                        <button
                          onClick={() => handleOpenRequestModal(rec)}
                          className="px-3 py-1.5 bg-[#0A7A74] hover:bg-[#08635e] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Request Mentorship</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBTAB: MY MENTORSHIP REQUESTS (Employee View)                             */}
          {/* ========================================================================= */}
          {activeSubTab === 'sent_requests' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Tracking Your Mentorship Requests</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Requests are reviewed by Admin / HR to ensure qualified mentor matching and optimal capacity.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSubTab('recommendations')}
                  className="px-3 py-1.5 bg-[#0A7A74] hover:bg-[#08635e] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Request</span>
                </button>
              </div>

              {sentRequests.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-3">
                  <BrainCircuit className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-800">You have no active mentorship requests.</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Browse expert recommendations to request 1-on-1 mentorship for your priority skill gaps.
                  </p>
                  <button
                    onClick={() => setActiveSubTab('recommendations')}
                    className="px-4 py-2 bg-[#0A7A74] text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Browse Recommendations</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sentRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold text-[10px]">
                            {req.skill_name || 'Engineering Competency'}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm mt-1">
                            {req.assigned_mentor_name
                              ? `Assigned Mentor: ${req.assigned_mentor_name}`
                              : req.recommended_mentor_name
                              ? `Admin Recommended: ${req.recommended_mentor_name}`
                              : `Proposed Mentor: ${req.requested_mentor_name || req.mentor_name}`}
                          </h4>
                          <p className="text-slate-500 text-xs mt-0.5">Goal: {req.goal}</p>
                        </div>
                        <div>{renderStatusBadge(req.status)}</div>
                      </div>

                      {/* Admin Notes or Rejection Reason Box */}
                      {req.admin_notes && (
                        <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-[11px] text-purple-900">
                          <strong className="font-bold block flex items-center gap-1 text-purple-950">
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-700" /> Admin Note:
                          </strong>
                          <span className="mt-0.5 block">{req.admin_notes}</span>
                        </div>
                      )}

                      {req.rejection_reason && (
                        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-900">
                          <strong className="font-bold block flex items-center gap-1 text-rose-950">
                            <XCircle className="w-3.5 h-3.5 text-rose-700" /> Rejection Explanation:
                          </strong>
                          <span className="mt-0.5 block">{req.rejection_reason}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Submitted on {new Date(req.requested_at || req.created_at).toLocaleDateString()}</span>
                        <button
                          onClick={() => handleOpenHistoryModal(req)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1 transition-colors"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>Audit Trail</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBTAB: INCOMING MENTOR PROPOSALS & APPROVALS (Mentor Review Portal)       */}
          {/* ========================================================================= */}
          {activeSubTab === 'received_requests' && (
            <div className="space-y-4">
              {/* Mentor Governance Banner */}
              <div className="p-4 bg-teal-50/90 border border-teal-200/90 rounded-2xl flex items-start gap-3 text-teal-950">
                <ShieldCheck className="w-5 h-5 text-[#0A7A74] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs">Mentor Direct Review & Endorsement Authority</h4>
                  <p className="text-[11px] text-teal-800 mt-0.5 leading-relaxed">
                    As an authorized Mentor / Specialist, you can review incoming mentorship requests from employees, confirm official 1-on-1 pairings, or recommend alternate specialists based on capacity and skill match.
                  </p>
                </div>
              </div>

              {receivedRequests.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                  <Clock3 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-800">No incoming mentorship requests assigned to you at this time.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {receivedRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold text-[10px]">
                            {req.skill_name}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm mt-1">{req.mentee_name}</h4>
                          <p className="text-slate-500 text-xs">
                            {req.mentee_designation} • {req.mentee_department}
                          </p>
                        </div>
                        <div>{renderStatusBadge(req.status)}</div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-700">
                        <strong className="font-bold block text-slate-900 mb-0.5">Mentee Learning Goal:</strong>
                        <p>{req.goal}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                        <button
                          onClick={() => handleOpenHistoryModal(req)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>Audit Trail</span>
                        </button>

                        {canApprove && ['Pending Admin Review', 'Mentor Recommended'].includes(req.status) && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedAdminRequest(req);
                                setAdminDecisionTab('recommend');
                                setAdminDecisionForm({
                                  selectedMentorId: '',
                                  adminNotes: '',
                                  rejectionReason: '',
                                });
                                setIsAdminDecisionModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl font-bold flex items-center gap-1 border border-sky-200"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Recommend Alternate</span>
                            </button>
                            <button
                              onClick={() => handleOpenAdminDecisionModal(req)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Accept & Confirm</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBTAB: ACTIVE MENTORSHIPS                                                */}
          {/* ========================================================================= */}
          {activeSubTab === 'active_pairings' && (
            <div className="space-y-4">
              {activeMentorships.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                  <UserCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-800">No active mentorship pairings found.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Once Admin / HR approves a mentorship request, it will appear here as an active 1-on-1 coaching engagement.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeMentorships.map((m) => (
                    <div key={m.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                            {m.skill_name || 'Technical Domain'}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm mt-1">
                            {m.mentor_name} & {m.mentee_name}
                          </h3>
                          <p className="text-slate-500 text-xs">Goal: {m.goal}</p>
                        </div>
                        {renderStatusBadge('Approved')}
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Start Date:</span>
                          <strong className="text-slate-900">{new Date(m.start_date).toLocaleDateString()}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Target End Date:</span>
                          <strong className="text-slate-900">{new Date(m.end_date).toLocaleDateString()}</strong>
                        </div>
                        {m.approved_by && (
                          <div className="flex justify-between pt-1 border-t border-slate-200/60 text-purple-800">
                            <span>Officially Confirmed By:</span>
                            <strong className="font-bold">{m.approved_by}</strong>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenHistoryModal(m)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>Audit Trail</span>
                        </button>
                        <button
                          onClick={() => {
                            setFeedbackMentorshipId(m.id);
                            setIsFeedbackModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete & Review</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 2: KNOWLEDGE-SHARING SESSIONS                                      */}
      {/* ========================================================================= */}
      {mainTab === 'sessions' && (
        <div className="space-y-6">
          {/* Controls Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSessionFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                  sessionFilter === 'ALL' ? 'bg-[#0A7A74] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Workshops ({sessions.length})
              </button>
              <button
                onClick={() => setSessionFilter('SCHEDULED')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                  sessionFilter === 'SCHEDULED' ? 'bg-[#0A7A74] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Upcoming & Open
              </button>
              <button
                onClick={() => setSessionFilter('COMPLETED')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                  sessionFilter === 'COMPLETED' ? 'bg-[#0A7A74] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Completed & Recorded
              </button>
              <button
                onClick={() => setSessionFilter('MY_REGISTERED')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                  sessionFilter === 'MY_REGISTERED' ? 'bg-[#0A7A74] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                My Registered Sessions
              </button>
            </div>

            <button
              onClick={() => {
                setSessionForm({
                  title: '',
                  description: '',
                  hostMentorId: '2',
                  skillId: '2',
                  sessionDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().slice(0, 16),
                  durationMinutes: '60',
                  maxCapacity: '20',
                  meetingLink: 'https://meet.google.com/okgip-knowledge-hub',
                  location: 'Virtual / Google Meet',
                });
                setIsCreateSessionModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Knowledge Session</span>
            </button>
          </div>

          {/* Sessions Grid */}
          {filteredSessions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
              <Video className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-800">No knowledge sharing sessions match the current filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSessions.map((session) => {
                const isFull = session.registered_count >= session.max_capacity;
                const fillPercentage = Math.min(100, Math.round((session.registered_count / session.max_capacity) * 100));

                return (
                  <div
                    key={session.id}
                    className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-500/50 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
                  >
                    {session.status === 'CANCELLED' && (
                      <div className="absolute top-0 right-0 left-0 bg-rose-500 text-white text-center py-0.5 text-[10px] font-black uppercase tracking-wider">
                        Session Cancelled
                      </div>
                    )}

                    <div className="space-y-3 pt-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold text-[10px]">
                          {session.skill_name || 'Engineering Architecture'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              session.status === 'COMPLETED'
                                ? 'bg-slate-100 text-slate-700'
                                : session.status === 'CANCELLED'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {session.status}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">{session.title}</h3>
                        <p className="text-slate-500 text-[11px] line-clamp-2 mt-1">{session.description}</p>
                      </div>

                      {/* Host & Schedule Details */}
                      <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" /> Expert Host:
                          </span>
                          <strong className="font-bold text-slate-800">{session.host_mentor_name}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date & Time:
                          </span>
                          <strong className="font-bold text-slate-800">
                            {new Date(session.session_date).toLocaleDateString()} at{' '}
                            {new Date(session.session_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> Duration:
                          </span>
                          <strong className="font-bold text-slate-800">{session.duration_minutes} mins</strong>
                        </div>
                      </div>

                      {/* Participant Capacity Meter */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-500">Participants Registered:</span>
                          <span className={isFull ? 'text-rose-600' : 'text-emerald-700'}>
                            {session.registered_count} / {session.max_capacity} seats {isFull && '(Full)'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${isFull ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${fillPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Effectiveness & Ratings */}
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <div className="flex items-center gap-1 text-amber-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{session.average_rating || 5.0} avg rating</span>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg">
                          <ThumbsUp className="w-3 h-3 text-emerald-600" />
                          <span>{session.effectiveness_score || 95}% Effectiveness</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {isGovernanceAdmin && (
                          <button
                            onClick={() => {
                              setAttendanceSession(session);
                              setIsAttendanceModalOpen(true);
                            }}
                            title="Attendance Roster"
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg text-xs"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        {isGovernanceAdmin && session.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleCancelSession(session)}
                            title="Cancel Session"
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg text-xs"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {session.status === 'SCHEDULED' && (
                          <>
                            {session.is_user_registered ? (
                              <button
                                onClick={() => handleCancelRegistration(session)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors"
                              >
                                Cancel Seat
                              </button>
                            ) : (
                              <button
                                disabled={isFull}
                                onClick={() => handleRegisterSession(session)}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 text-white shadow-sm transition-all ${
                                  isFull ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                                }`}
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>{isFull ? 'Session Full' : 'Register'}</span>
                              </button>
                            )}
                          </>
                        )}

                        {session.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleCompleteSession(session)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                          >
                            Conclude
                          </button>
                        )}

                        {session.status === 'COMPLETED' && (
                          <button
                            onClick={() => {
                              setSessionFeedbackTarget(session);
                              setIsSessionFeedbackModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                          >
                            <Star className="w-3.5 h-3.5" />
                            <span>Rate & Feedback</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 3: INTERNAL EXPERT DIRECTORY                                       */}
      {/* ========================================================================= */}
      {mainTab === 'experts' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={expertSearchQuery}
                  onChange={(e) => setExpertSearchQuery(e.target.value)}
                  placeholder="Search internal experts by skill (e.g. Java, Spring Boot, React, AWS, SQL), name, or domain..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A7A74]"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Department:</span>
                <select
                  value={expertDeptFilter}
                  onChange={(e) => setExpertDeptFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                >
                  {uniqueExpertDepts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Proficiency:</span>
                <select
                  value={expertProficiencyFilter}
                  onChange={(e) => setExpertProficiencyFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                >
                  <option value="All">All Proficiency Levels</option>
                  <option value="Expert">Expert (Level 5)</option>
                  <option value="Advanced">Advanced (Level 4)</option>
                  <option value="Intermediate">Intermediate (Level 3)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
              <span>
                Found <strong className="text-slate-900 font-bold">{filteredExperts.length}</strong> matching verified internal experts
              </span>
              <span>Ranked by Proficiency & Mentorship Effectiveness</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold">
                    <th className="py-3.5 px-5">Expert</th>
                    <th className="py-3.5 px-4">Skill Domain</th>
                    <th className="py-3.5 px-4">Proficiency</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Mentorship Rating</th>
                    <th className="py-3.5 px-4">Availability</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExperts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No internal experts found matching your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredExperts.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#0A7A74]/10 text-[#0A7A74] flex items-center justify-center font-bold text-xs">
                              {exp.expert_name.charAt(0)}
                            </div>
                            <div>
                              <strong className="text-slate-900 font-bold block">{exp.expert_name}</strong>
                              <span className="text-[11px] text-slate-500">{exp.designation}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg font-bold text-[11px]">
                            {exp.skill_name}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              exp.proficiency === 'Expert'
                                ? 'bg-emerald-100 text-emerald-800'
                                : exp.proficiency === 'Advanced'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {exp.proficiency} (Level {exp.current_proficiency}/5)
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-700">{exp.department_name}</td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {exp.rating}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            {exp.availability}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedExpertProfile(exp);
                                setIsExpertProfileModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                            >
                              Profile
                            </button>
                            <button
                              onClick={() => handleOpenRequestModal(exp)}
                              className="px-3 py-1.5 bg-[#0A7A74] hover:bg-[#08635e] text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Request</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS SECTION                                                            */}
      {/* ========================================================================= */}

      {/* 1. Request Mentorship Modal (Employee Submits) */}
      {isRequestModalOpen && selectedMentor && (
        <Modal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          title={`Submit Mentorship Proposal to Admin / HR`}
        >
          <form onSubmit={handleSendRequest} className="space-y-4 text-xs">
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1">
              <p className="font-bold text-teal-950">
                Proposed Mentor: {selectedMentor.mentorName || selectedMentor.mentor_name || selectedMentor.expert_name} ({selectedMentor.mentor_designation || selectedMentor.designation || 'Specialist'})
              </p>
              <p className="text-teal-800 text-[11px]">
                Domain Specialization: {selectedMentor.skill_name || selectedMentor.skillName || 'Technical Specialization'}
              </p>
            </div>

            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Admin Approval Workflow:</strong> Your proposal will be submitted into <em>Pending Admin Review</em>. Admin/HR authorities will review compatibility, mentor load, and officially confirm the mentor assignment.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Skill & Competency</label>
              <select
                value={requestForm.skillId}
                onChange={(e) => setRequestForm({ ...requestForm, skillId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
              >
                {skillsList.map((sk) => (
                  <option key={sk.id} value={sk.id}>
                    {sk.name} ({sk.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mentorship Goal & Expected Milestones *</label>
              <textarea
                rows={3}
                value={requestForm.goal}
                onChange={(e) => setRequestForm({ ...requestForm, goal: e.target.value })}
                placeholder="What specific skills or milestones do you want to accomplish?"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                required
              />
            </div>

            <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl flex items-center gap-2.5 text-teal-900">
              <Calendar className="w-4 h-4 text-[#0A7A74] shrink-0" />
              <div className="text-[11px]">
                <strong className="font-bold block">Standard 90-Day Skill Acceleration Cohort</strong>
                <span className="text-teal-700">Official schedule and coaching cadence are established upon Admin/Mentor confirmation.</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={requestSubmitting}
                className="px-5 py-2 bg-[#0A7A74] hover:bg-[#08635e] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{requestSubmitting ? 'Submitting...' : 'Submit to Admin / HR'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 2. Admin Review & Decision Modal (Admin Only) */}
      {isAdminDecisionModalOpen && selectedAdminRequest && (
        <Modal
          isOpen={isAdminDecisionModalOpen}
          onClose={() => setIsAdminDecisionModalOpen(false)}
          title={`Admin Governance: Request MNT-${String(selectedAdminRequest.id).padStart(5, '0')}`}
        >
          <div className="space-y-4 text-xs">
            {/* Request Summary Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mentee Profile</span>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedAdminRequest.mentee_name}</h4>
                  <p className="text-slate-500 text-[11px]">
                    {selectedAdminRequest.mentee_designation} • {selectedAdminRequest.mentee_department}
                  </p>
                </div>
                <div>{renderStatusBadge(selectedAdminRequest.status)}</div>
              </div>

              <div className="pt-2 border-t border-slate-200/70 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Target Skill:</span>
                  <strong className="text-slate-900">{selectedAdminRequest.skill_name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Proposed Mentor:</span>
                  <strong className="text-slate-900">{selectedAdminRequest.requested_mentor_name || 'Requested Specialist'}</strong>
                </div>
              </div>

              <div className="pt-1 text-[11px]">
                <span className="text-slate-500 block">Goal:</span>
                <p className="text-slate-700 italic">"{selectedAdminRequest.goal}"</p>
              </div>
            </div>

            {/* Decision Action Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setAdminDecisionTab('approve')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  adminDecisionTab === 'approve' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve & Assign</span>
              </button>
              <button
                onClick={() => setAdminDecisionTab('recommend')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  adminDecisionTab === 'recommend' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recommend Mentor</span>
              </button>
              <button
                onClick={() => setAdminDecisionTab('reject')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  adminDecisionTab === 'reject' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject Request</span>
              </button>
            </div>

            {/* ACTION 1: APPROVE & ASSIGN */}
            {adminDecisionTab === 'approve' && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confirm Mentor Assignment</label>
                  <select
                    value={adminDecisionForm.selectedMentorId}
                    onChange={(e) => setAdminDecisionForm({ ...adminDecisionForm, selectedMentorId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  >
                    {experts.map((exp) => (
                      <option key={exp.employee_id} value={exp.employee_id}>
                        {exp.expert_name} ({exp.designation} - {exp.department_name}) [Proficiency: Level {exp.current_proficiency}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl flex items-center gap-2.5 text-teal-900">
                  <Calendar className="w-4 h-4 text-[#0A7A74] shrink-0" />
                  <div className="text-[11px]">
                    <strong className="font-bold block">Standard 90-Day Competency Cohort Assignment</strong>
                    <span className="text-teal-700">Timeline will be calculated and tracked automatically upon confirmation.</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Admin Approval Notes</label>
                  <textarea
                    rows={2}
                    value={adminDecisionForm.adminNotes}
                    onChange={(e) => setAdminDecisionForm({ ...adminDecisionForm, adminNotes: e.target.value })}
                    placeholder="e.g. Approved. Mentor assigned based on capacity and skill gap priority."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdminDecisionModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={adminActionSubmitting}
                    onClick={handleAdminApprove}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{adminActionSubmitting ? 'Confirming...' : 'Approve & Confirm Assignment'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ACTION 2: RECOMMEND MENTOR */}
            {adminDecisionTab === 'recommend' && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Alternate / Recommended Mentor</label>
                  <select
                    value={adminDecisionForm.selectedMentorId}
                    onChange={(e) => setAdminDecisionForm({ ...adminDecisionForm, selectedMentorId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  >
                    <option value="">-- Choose Recommended Expert --</option>
                    {experts.map((exp) => (
                      <option key={exp.employee_id} value={exp.employee_id}>
                        {exp.expert_name} ({exp.designation} - {exp.department_name}) [Rating: {exp.rating}★]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recommendation Reason / Guidance *</label>
                  <textarea
                    rows={3}
                    value={adminDecisionForm.adminNotes}
                    onChange={(e) => setAdminDecisionForm({ ...adminDecisionForm, adminNotes: e.target.value })}
                    placeholder="Explain why this mentor is recommended (e.g. domain specialist, better load availability)..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdminDecisionModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={adminActionSubmitting}
                    onClick={handleAdminRecommend}
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{adminActionSubmitting ? 'Recording...' : 'Submit Recommendation'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ACTION 3: REJECT REQUEST */}
            {adminDecisionTab === 'reject' && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block font-bold text-rose-800 mb-1">Rejection Reason *</label>
                  <textarea
                    rows={3}
                    value={adminDecisionForm.rejectionReason}
                    onChange={(e) => setAdminDecisionForm({ ...adminDecisionForm, rejectionReason: e.target.value })}
                    placeholder="Provide a constructive reason to the employee for why this request cannot be approved..."
                    className="w-full p-2.5 bg-rose-50/60 border border-rose-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdminDecisionModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={adminActionSubmitting}
                    onClick={handleAdminReject}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{adminActionSubmitting ? 'Rejecting...' : 'Confirm Rejection'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* 3. Audit History / Timeline Modal */}
      {isHistoryModalOpen && historyRequest && (
        <Modal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          title={`Request Audit Trail: MNT-${String(historyRequest.id).padStart(5, '0')}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <strong className="font-bold text-slate-900 block">{historyRequest.mentee_name}</strong>
                <span className="text-[11px] text-slate-500">Skill: {historyRequest.skill_name}</span>
              </div>
              <div>{renderStatusBadge(historyRequest.status)}</div>
            </div>

            {historyLoading ? (
              <div className="p-8 text-center text-slate-400">
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading audit history...
              </div>
            ) : historyList.length === 0 ? (
              <p className="text-center py-6 text-slate-400">No recorded audit history entries.</p>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {historyList.map((item, idx) => (
                  <div key={idx} className="relative space-y-1">
                    <div className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-purple-600 flex items-center justify-center" />
                    <div className="flex items-center justify-between">
                      <strong className="font-bold text-slate-900">{item.action.replace(/_/g, ' ')}</strong>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Performed by: <strong className="text-slate-800">{item.performed_by_name}</strong> ({item.performed_by_role})
                    </div>
                    {item.comments && (
                      <p className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-700 border border-slate-100">
                        {item.comments}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Close Audit Trail
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 4. Create Knowledge Session Modal */}
      {isCreateSessionModalOpen && (
        <Modal
          isOpen={isCreateSessionModalOpen}
          onClose={() => setIsCreateSessionModalOpen(false)}
          title="Schedule Knowledge Sharing Workshop"
        >
          <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Session Title *</label>
              <input
                type="text"
                value={sessionForm.title}
                onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                placeholder="e.g. Advanced Spring Boot Reactive Streams & Kafka"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Description & Key Takeaways</label>
              <textarea
                rows={2}
                value={sessionForm.description}
                onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                placeholder="Overview of hands-on topics covered..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Skill Topic</label>
                <select
                  value={sessionForm.skillId}
                  onChange={(e) => setSessionForm({ ...sessionForm, skillId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  {skillsList.map((sk) => (
                    <option key={sk.id} value={sk.id}>
                      {sk.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={sessionForm.sessionDate}
                  onChange={(e) => setSessionForm({ ...sessionForm, sessionDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  value={sessionForm.durationMinutes}
                  onChange={(e) => setSessionForm({ ...sessionForm, durationMinutes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Max Participants</label>
                <input
                  type="number"
                  value={sessionForm.maxCapacity}
                  onChange={(e) => setSessionForm({ ...sessionForm, maxCapacity: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Virtual Meeting Link</label>
              <input
                type="text"
                value={sessionForm.meetingLink}
                onChange={(e) => setSessionForm({ ...sessionForm, meetingLink: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateSessionModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
              >
                Schedule Workshop
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 5. Edit Session Modal */}
      {isEditSessionModalOpen && selectedSession && (
        <Modal
          isOpen={isEditSessionModalOpen}
          onClose={() => setIsEditSessionModalOpen(false)}
          title="Edit Knowledge Sharing Session"
        >
          <form onSubmit={handleEditSession} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Session Title</label>
              <input
                type="text"
                value={sessionForm.title}
                onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={sessionForm.description}
                onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={sessionForm.sessionDate}
                  onChange={(e) => setSessionForm({ ...sessionForm, sessionDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Max Capacity</label>
                <input
                  type="number"
                  value={sessionForm.maxCapacity}
                  onChange={(e) => setSessionForm({ ...sessionForm, maxCapacity: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditSessionModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0A7A74] hover:bg-[#08635e] text-white rounded-xl font-bold shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 6. Session Attendance Roster Modal */}
      {isAttendanceModalOpen && attendanceSession && (
        <Modal
          isOpen={isAttendanceModalOpen}
          onClose={() => setIsAttendanceModalOpen(false)}
          title={`Attendance Roster: ${attendanceSession.title}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-500">
              Record attendance for registered attendees to calculate session completion and peer effectiveness.
            </p>

            {!attendanceSession.registrations || attendanceSession.registrations.length === 0 ? (
              <p className="text-center py-6 text-slate-400">No participants registered yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {attendanceSession.registrations.map((reg) => (
                  <div key={reg.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <strong className="font-bold text-slate-900 block">{reg.employee_name}</strong>
                      <span className="text-[11px] text-slate-500">{reg.department_name || 'Tech'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRecordAttendance(attendanceSession.id, reg.employee_id, 'ATTENDED')}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                          reg.attendance_status === 'ATTENDED'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Attended
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRecordAttendance(attendanceSession.id, reg.employee_id, 'ABSENT')}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                          reg.attendance_status === 'ABSENT'
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAttendanceModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Close Roster
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 7. Session Rating & Feedback Modal */}
      {isSessionFeedbackModalOpen && sessionFeedbackTarget && (
        <Modal
          isOpen={isSessionFeedbackModalOpen}
          onClose={() => setIsSessionFeedbackModalOpen(false)}
          title={`Submit Feedback: ${sessionFeedbackTarget.title}`}
        >
          <form onSubmit={handleSubmitSessionFeedback} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-2">Session Rating (1 - 5 Stars)</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSessionFeedbackRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= sessionFeedbackRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 font-bold text-slate-800 text-sm">{sessionFeedbackRating} / 5 Stars</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Feedback & Comments</label>
              <textarea
                rows={3}
                value={sessionFeedbackComment}
                onChange={(e) => setSessionFeedbackComment(e.target.value)}
                placeholder="How practical was the workshop? Did it help close key knowledge gaps?"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                required
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSessionFeedbackModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
              >
                Submit Feedback
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 8. Expert Profile Modal (Module 3) */}
      {expertProfileModalOpen && selectedExpertProfile && (
        <Modal
          isOpen={expertProfileModalOpen}
          onClose={() => setIsExpertProfileModalOpen(false)}
          title={`Internal Expert Profile: ${selectedExpertProfile.expert_name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-[#0A7A74] text-white flex items-center justify-center font-bold text-lg">
                {selectedExpertProfile.expert_name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{selectedExpertProfile.expert_name}</h3>
                <p className="text-slate-500">{selectedExpertProfile.designation}</p>
                <p className="text-[#0A7A74] font-semibold text-[11px]">{selectedExpertProfile.department_name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-slate-500 block text-[10px]">Verified Skill</span>
                <strong className="font-bold text-emerald-900 text-xs">{selectedExpertProfile.skill_name}</strong>
                <span className="text-emerald-700 font-semibold block text-[11px] mt-0.5">
                  Proficiency: {selectedExpertProfile.proficiency} (Level {selectedExpertProfile.current_proficiency}/5)
                </span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-slate-500 block text-[10px]">Mentorship Track Record</span>
                <div className="flex items-center gap-1 text-amber-900 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{selectedExpertProfile.rating} Average Rating</span>
                </div>
                <span className="text-amber-800 text-[11px] block mt-0.5">
                  {selectedExpertProfile.active_mentees_count} Mentees Guided
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsExpertProfileModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsExpertProfileModalOpen(false);
                  handleOpenRequestModal(selectedExpertProfile);
                }}
                className="px-5 py-2 bg-[#0A7A74] hover:bg-[#08635e] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Request Mentorship</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 9. Mentorship Feedback Modal */}
      {isFeedbackModalOpen && (
        <Modal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          title="Complete Mentorship & Submit Feedback"
        >
          <form onSubmit={handleCompleteMentorship} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-2">Mentor Effectiveness Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= feedbackRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Feedback & Outcomes Achieved</label>
              <textarea
                rows={3}
                value={feedbackComments}
                onChange={(e) => setFeedbackComments(e.target.value)}
                placeholder="Describe key skill gains or milestones accomplished during this mentorship..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                required
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFeedbackModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
              >
                Finalize & Submit
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
