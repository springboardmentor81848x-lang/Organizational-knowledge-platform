import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  UserCheck,
  Building2,
  ShieldAlert,
  AlertCircle,
  FileText,
  Trash2,
  MessageSquare,
  Sparkles,
  Filter,
  User,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ApproverInfo {
  userId: number;
  employeeId: number | null;
  name: string;
  email: string;
  role: string;
  designation: string;
  departmentName: string;
}

interface LeaveRequestItem {
  id: number;
  employee_id: number;
  employee_name: string;
  department_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  number_of_days: number;
  reason: string;
  approver_id: number;
  approver_name: string;
  approver_role: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approver_comments?: string;
  approved_by?: string;
  submitted_at: string;
  approved_at?: string | null;
  rejected_at?: string | null;
}

export const LeaveManagement: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequestItem[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<LeaveRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assigned' | 'my' | 'all'>('my');

  // Modal States
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [approverInfo, setApproverInfo] = useState<ApproverInfo | null>(null);
  const [loadingApprover, setLoadingApprover] = useState(false);
  const [approverError, setApproverError] = useState('');

  // Apply Form
  const [leaveType, setLeaveType] = useState('Casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Approval Action Modal
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequestItem | null>(null);
  const [actionType, setActionType] = useState<'Approve' | 'Reject' | null>(null);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // Success Feedback Message
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const isApproverRole =
    user?.role === 'Manager' ||
    user?.role === 'Team Lead' ||
    user?.role === 'Department Head' ||
    user?.role === 'HR Specialist' ||
    user?.role === 'Admin';

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const [allRes, pendingRes] = await Promise.all([
        api.get('/leaves'),
        api.get('/leaves/pending'),
      ]);

      if (allRes.data.success) {
        setLeaves(allRes.data.data);
      }
      if (pendingRes.data.success) {
        setPendingApprovals(pendingRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load leave records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
    // Default tab setting based on role
    if (user?.role === 'Employee' || user?.role === 'L&D Admin / Mentor') {
      setActiveTab('my');
    } else {
      setActiveTab('assigned');
    }
  }, [user]);

  // Fetch approver info when apply modal opens
  const handleOpenApplyModal = async () => {
    setShowApplyModal(true);
    setFormError('');
    setLoadingApprover(true);
    setApproverError('');
    setApproverInfo(null);

    try {
      const res = await api.get('/leaves/approver-info');
      if (res.data.success && res.data.approver) {
        setApproverInfo(res.data.approver);
      } else {
        setApproverError(res.data.message || 'We could not determine your leave approver. Please contact HR.');
      }
    } catch (err: any) {
      setApproverError(
        err.response?.data?.message || 'We could not determine your leave approver. Please contact HR.'
      );
    } finally {
      setLoadingApprover(false);
    }
  };

  // Calculate automatic days duration
  const calculatedDays = React.useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return 0;
    const diff = Math.abs(e.getTime() - s.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!startDate || !endDate) {
      setFormError('Please select both Start Date and End Date.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setFormError('End Date cannot be before Start Date.');
      return;
    }

    if (!reason.trim()) {
      setFormError('Reason for leave is required.');
      return;
    }

    if (!approverInfo) {
      setFormError('We could not determine your leave approver. Please contact HR.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/leaves', {
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      });

      if (res.data.success) {
        setShowApplyModal(false);
        setReason('');
        setStartDate('');
        setEndDate('');
        showToast('success', res.data.message || 'Leave request submitted successfully.');
        fetchLeaveData();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActionClick = (leave: LeaveRequestItem, type: 'Approve' | 'Reject') => {
    setSelectedLeave(leave);
    setActionType(type);
    setComment('');
    setActionError('');
  };

  const handleConfirmAction = async () => {
    if (!selectedLeave || !actionType) return;
    setActionLoading(true);
    setActionError('');

    try {
      const endpoint =
        actionType === 'Approve'
          ? `/leaves/${selectedLeave.id}/approve`
          : `/leaves/${selectedLeave.id}/reject`;

      const res = await api.put(endpoint, { comments: comment });
      if (res.data.success) {
        setSelectedLeave(null);
        setActionType(null);
        showToast('success', res.data.message || `Leave request ${actionType.toLowerCase()}d successfully.`);
        fetchLeaveData();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || `Failed to ${actionType.toLowerCase()} leave request.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelLeave = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this pending leave request?')) return;
    try {
      const res = await api.delete(`/leaves/${id}`);
      if (res.data.success) {
        showToast('success', 'Leave request cancelled.');
        fetchLeaveData();
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to cancel leave request.');
    }
  };

  // Filter list by tab
  const displayedLeaves = React.useMemo(() => {
    if (activeTab === 'assigned') {
      return leaves.filter((l) => l.approver_id === user?.id || pendingApprovals.some((p) => p.id === l.id));
    }
    if (activeTab === 'my') {
      return leaves.filter((l) => l.employee_name.toLowerCase().includes((user?.email || '').split('@')[0].toLowerCase()) || l.employee_id === user?.id);
    }
    return leaves;
  }, [leaves, pendingApprovals, activeTab, user]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-lg animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-black/5 rounded-lg cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <CalendarDays className="w-3.5 h-3.5 text-emerald-400" /> Organizational Leave Hierarchy Portal
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-slate-200 text-[10px] font-bold border border-white/15">
                Role: <span className="text-emerald-300">{user?.role}</span>
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Leave Requests & Absence Management
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1.5 max-w-2xl leading-relaxed">
              Apply for leaves with automated hierarchy routing (Team Lead → Dept Head → HR Specialist), track live approval status, and manage team absences.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenApplyModal}
            className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all hover:scale-105 shrink-0 uppercase tracking-wide"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" /> Apply For Leave
          </button>
        </div>
      </div>

      {/* Role-Based Tabs & Counters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full sm:w-auto">
          {isApproverRole && (
            <button
              onClick={() => setActiveTab('assigned')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'assigned'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assigned To Me</span>
              {pendingApprovals.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] animate-pulse">
                  {pendingApprovals.length}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('my')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'my'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Leave History</span>
          </button>

          {(user?.role === 'HR Specialist' || user?.role === 'Admin') && (
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Organization Records</span>
            </button>
          )}
        </div>

        <div className="text-slate-500 text-xs font-semibold flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Showing {displayedLeaves.length} record(s)</span>
        </div>
      </div>

      {/* Pending Action Alert Banner for Approvers */}
      {isApproverRole && pendingApprovals.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center font-bold shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">Action Required: Pending Leave Approvals</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                You have <strong className="font-black">{pendingApprovals.length}</strong> leave request(s) awaiting your decision in your approval queue.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('assigned')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer shrink-0"
          >
            Review Queue →
          </button>
        </div>
      )}

      {/* Leave Requests Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-emerald-600" />
            {activeTab === 'assigned'
              ? 'Leave Requests Assigned To Me For Approval'
              : activeTab === 'my'
              ? 'My Personal Leave Requests & History'
              : 'Organization-Wide Leave Directory'}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Employee</th>
                <th className="p-4">Leave Details</th>
                <th className="p-4">Duration & Days</th>
                <th className="p-4">Sent To (Approver)</th>
                <th className="p-4">Status & Comments</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-semibold">
                    Loading leave records...
                  </td>
                </tr>
              ) : displayedLeaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-medium">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No leave requests found for this view.
                  </td>
                </tr>
              ) : (
                displayedLeaves.map((l) => {
                  const isAssignedToUser = l.approver_id === user?.id || (user?.role === 'HR Specialist' && l.approver_role === 'HR Specialist');
                  const isUserOwnLeave = l.employee_name.toLowerCase().includes((user?.email || '').split('@')[0].toLowerCase()) || l.employee_id === user?.id;

                  return (
                    <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Employee Column */}
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-xs">{l.employee_name}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{l.department_name}</span>
                        </div>
                      </td>

                      {/* Leave Type & Reason Column */}
                      <td className="p-4 max-w-xs">
                        <span className="inline-block text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 mb-1">
                          {l.leave_type} Leave
                        </span>
                        <div className="text-[11px] text-slate-600 truncate max-w-xs" title={l.reason}>
                          "{l.reason}"
                        </div>
                      </td>

                      {/* Dates & Days */}
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-xs">
                          {l.start_date} → {l.end_date}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                          {l.number_of_days || 1} Day(s) Total
                        </div>
                      </td>

                      {/* Sent To (Approver) */}
                      <td className="p-4">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 inline-block">
                          <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            <span>{l.approver_name}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            Role: <strong className="text-slate-700">{l.approver_role}</strong>
                          </div>
                        </div>
                      </td>

                      {/* Status & Approver Comments */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                              l.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : l.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {l.status === 'Approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {l.status === 'Rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                            {l.status === 'Pending' && <Clock className="w-3 h-3 text-amber-600 animate-pulse" />}
                            {l.status}
                          </span>

                          {l.approver_comments && (
                            <div className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100 max-w-xs flex items-start gap-1">
                              <MessageSquare className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                              <span className="italic">"{l.approver_comments}"</span>
                            </div>
                          )}

                          {l.approved_by && (
                            <div className="text-[9px] text-slate-400">
                              By {l.approved_by}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        {l.status === 'Pending' ? (
                          isAssignedToUser && !isUserOwnLeave ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleActionClick(l, 'Approve')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[10px] flex items-center gap-1 cursor-pointer shadow-xs transition-all"
                              >
                                <Check className="w-3 h-3" /> Approve
                              </button>
                              <button
                                onClick={() => handleActionClick(l, 'Reject')}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-[10px] flex items-center gap-1 cursor-pointer shadow-xs transition-all"
                              >
                                <X className="w-3 h-3" /> Reject
                              </button>
                            </div>
                          ) : isUserOwnLeave ? (
                            <button
                              onClick={() => handleCancelLeave(l.id)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-300 font-bold rounded-xl text-[10px] inline-flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Trash2 className="w-3 h-3" /> Cancel
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">Awaiting Approver</span>
                          )
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLY LEAVE MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-600" /> Apply For Leave
              </h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              {/* Leave Type */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Leave Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Casual">Casual Leave</option>
                  <option value="Annual">Annual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Study">Study / Exam Leave</option>
                  <option value="Maternity/Paternity">Maternity/Paternity Leave</option>
                </select>
              </div>

              {/* Start & End Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    End Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Automatic Duration Display */}
              {calculatedDays > 0 && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900 font-bold">
                  <span className="text-xs">Calculated Absence Duration:</span>
                  <span className="text-sm font-black px-3 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                    {calculatedDays} Day(s)
                  </span>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Reason For Leave <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  placeholder="Provide brief reason for your absence request..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:outline-none focus:border-emerald-500 h-20"
                />
              </div>

              {/* Send Leave Request To (DYNAMIC APPROVER SECTION) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" /> Send Leave Request To (Auto-Determined)
                </p>

                {loadingApprover ? (
                  <div className="p-3 text-center text-slate-500 font-bold animate-pulse text-xs">
                    Identifying reporting manager from organizational hierarchy...
                  </div>
                ) : approverError ? (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{approverError}</span>
                  </div>
                ) : approverInfo ? (
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-black text-xs flex items-center justify-center">
                          👤
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900">{approverInfo.name}</div>
                          <div className="text-[10px] text-emerald-700 font-bold">{approverInfo.role}</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                        {approverInfo.designation}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>Department: <strong className="text-slate-800">{approverInfo.departmentName}</strong></span>
                      <span className="text-[10px] text-slate-400 font-mono">{approverInfo.email}</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !approverInfo}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md cursor-pointer disabled:opacity-50 text-xs tracking-wide uppercase"
                >
                  {submitting ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVAL / REJECTION CONFIRMATION MODAL */}
      {selectedLeave && actionType && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl relative animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                {actionType === 'Approve' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
                {actionType} Leave Request
              </h3>
              <button
                onClick={() => {
                  setSelectedLeave(null);
                  setActionType(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {actionError}
              </div>
            )}

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div>Employee: <strong className="text-slate-900 font-bold">{selectedLeave.employee_name}</strong></div>
              <div>Leave Type: <span className="font-bold text-emerald-700">{selectedLeave.leave_type} Leave</span> ({selectedLeave.number_of_days} days)</div>
              <div>Dates: <span className="font-bold text-slate-800">{selectedLeave.start_date} → {selectedLeave.end_date}</span></div>
              <div className="text-slate-500 italic mt-1 font-medium">"{selectedLeave.reason}"</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Approver Comments / Remarks (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={actionType === 'Approve' ? 'e.g. Approved. Please hand over active tasks.' : 'e.g. High project workload during this period.'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-500 h-20"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedLeave(null);
                  setActionType(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmAction}
                className={`flex-1 py-2.5 rounded-xl text-white font-bold shadow-md cursor-pointer disabled:opacity-50 text-xs uppercase tracking-wide ${
                  actionType === 'Approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {actionLoading ? 'Processing...' : `Confirm ${actionType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
