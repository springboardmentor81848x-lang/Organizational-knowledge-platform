import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Info,
  Users,
  GraduationCap,
  Sparkles,
  Check,
  Filter,
  ArrowRight,
  ShieldCheck,
  Mail,
  MessageSquare,
  Smartphone,
  Send,
  Zap,
  Clock,
  ExternalLink,
  RefreshCw,
  Award,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { NotificationItem } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { Toast, ToastMessage } from '../components/Toast';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [sendingAlert, setSendingAlert] = useState(false);

  // Form state for custom dispatch simulator
  const [simType, setSimType] = useState<string>('Gap Alert');
  const [simTitle, setSimTitle] = useState<string>('Critical Skill Gap Alert ⚠️');
  const [simMessage, setSimMessage] = useState<string>('A critical skill gap has been identified in Spring Boot (Required: Advanced, Current: Beginner).');
  const [simChannelEmail, setSimChannelEmail] = useState(true);
  const [simChannelSms, setSimChannelSms] = useState(true);
  const [simChannelPush, setSimChannelPush] = useState(true);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/all/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      addToast('success', 'All Caught Up!', 'All notifications marked as read.');
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulatePreset = (preset: 'gap' | 'training' | 'mentor' | 'milestone' | 'assessment') => {
    if (preset === 'gap') {
      setSimType('Gap Alert');
      setSimTitle('Critical Skill Gap Alert: Spring Boot ⚠️');
      setSimMessage('A critical skill gap has been identified in Spring Boot. Required: Advanced (Level 4), Current: Beginner (Level 1).');
    } else if (preset === 'training') {
      setSimType('Training Reminder');
      setSimTitle('Training Deadline Reminder: Java Course ⏳');
      setSimMessage('Your Java training deadline is approaching on Aug 30, 2026. Complete remaining modules to earn certification.');
    } else if (preset === 'mentor') {
      setSimType('Mentorship Reminder');
      setSimTitle('Mentorship Session Scheduled Tomorrow 🤝');
      setSimMessage('Your mentorship session is scheduled tomorrow with Marcus Aurelius at 15:00 UTC on Google Meet.');
    } else if (preset === 'milestone') {
      setSimType('Learning Achievement');
      setSimTitle('Learning Achievement Unlocked! 🚀');
      setSimMessage('Congratulations! You completed 80% of your Enterprise Cloud & Docker Mastery learning path.');
    } else if (preset === 'assessment') {
      setSimType('Assessment Reminder');
      setSimTitle('Skill Assessment Due Tomorrow 📝');
      setSimMessage('Your skill assessment for Cloud Infrastructure & Kubernetes is due tomorrow.');
    }
  };

  const handleDispatchCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simTitle || !simMessage) {
      addToast('error', 'Validation Error', 'Title and message are required.');
      return;
    }

    try {
      setSendingAlert(true);
      const res = await api.post('/notifications/dispatch', {
        title: simTitle,
        message: simMessage,
        type: simType,
        priority: 'High',
        channels: {
          in_app: true,
          email: simChannelEmail,
          sms: simChannelSms,
          push: simChannelPush,
        },
      });

      if (res.data.success) {
        addToast(
          'success',
          'Multichannel Notification Dispatched! 🚀',
          `Delivered via In-App ${simChannelEmail ? '+ Email (JavaMailSender) ' : ''}${simChannelSms ? '+ SMS (Twilio) ' : ''}${simChannelPush ? '+ Push (FCM)' : ''}`
        );
        setShowSimulateModal(false);
        fetchNotifications();
      }
    } catch (err: any) {
      addToast('error', 'Dispatch Error', err.response?.data?.message || err.message);
    } finally {
      setSendingAlert(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'GAPS') return n.type === 'Gap Alert' || n.title.toLowerCase().includes('gap');
    if (filterType === 'TRAINING') return n.type === 'Training Assigned' || n.type === 'Training Reminder' || n.title.toLowerCase().includes('training') || n.title.toLowerCase().includes('course');
    if (filterType === 'MENTORSHIP') return n.type === 'Mentorship Reminder' || n.title.toLowerCase().includes('mentor') || n.title.toLowerCase().includes('session');
    if (filterType === 'ACHIEVEMENT') return n.type === 'Learning Achievement' || n.type === 'Learning Milestone' || n.type === 'Certificate Earned' || n.title.toLowerCase().includes('achievement') || n.title.toLowerCase().includes('congratulations');
    if (filterType === 'ASSESSMENT') return n.type === 'Assessment Reminder' || n.title.toLowerCase().includes('assessment') || n.title.toLowerCase().includes('proficiency');
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6 text-xs text-slate-800">
      <Toast toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Page Header */}
      <PageHeader
        title="Module 10 – Notifications & Alerts Intelligence"
        subtitle="Multichannel alert delivery via In-App, Email (JavaMailSender), SMS (Twilio), and Push (Firebase Cloud Messaging)"
        breadcrumbs={[
          { label: 'Intelligence' },
          { label: 'Module 10 Notifications' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSimulateModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer text-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Multichannel Alert</span>
            </button>
            <button
              onClick={markAllRead}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-[#0A7A74] hover:text-[#0A7A74] font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer text-xs"
            >
              <Check className="w-3.5 h-3.5 text-[#0A7A74]" />
              <span>Mark All Read</span>
            </button>
            <button
              onClick={fetchNotifications}
              className="px-3.5 py-2 rounded-xl bg-[#0A7A74] hover:bg-[#086963] text-white font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      {/* Multichannel Technology Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-teal-800/40 rounded-2xl p-4 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-extrabold text-[10px] border border-teal-400/30">
              MULTICHANNEL NOTIFICATION ENGINE
            </span>
            <span className="text-[11px] text-slate-300 font-medium">Enterprise Technology Stack</span>
          </div>
          <p className="text-xs text-slate-300">
            Real-time event synchronization across <strong className="text-white">Email (JavaMailSender)</strong>, <strong className="text-white">SMS (Twilio)</strong>, and <strong className="text-white">Push Notifications (Firebase Cloud Messaging)</strong>.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold">
            <Mail className="w-3.5 h-3.5 text-teal-400" />
            <span>JavaMailSender</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Twilio SMS</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold">
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>Firebase Push</span>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Unread Alerts"
          value={String(unreadCount)}
          change={unreadCount > 0 ? 'Requires action' : 'All clear'}
          trend={unreadCount > 0 ? 'down' : 'up'}
          icon={Bell}
          variant="teal"
        />
        <StatCard
          label="Gap Alerts"
          value={String(notifications.filter((n) => n.type === 'Gap Alert' || n.title.includes('Gap')).length)}
          change="Critical skill deficits"
          trend="neutral"
          icon={AlertTriangle}
          variant="light-teal"
        />
        <StatCard
          label="Mentorship Alerts"
          value={String(notifications.filter((n) => n.type === 'Mentorship Reminder' || n.title.includes('Mentor') || n.title.includes('Session')).length)}
          change="Peer pairing & schedule"
          trend="up"
          icon={Users}
          variant="white"
        />
        <StatCard
          label="Achievements & Deadlines"
          value={String(notifications.filter((n) => n.type === 'Learning Achievement' || n.type === 'Training Reminder' || n.type === 'Assessment Reminder').length)}
          change="Milestone milestones"
          trend="up"
          icon={GraduationCap}
          variant="white"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        {[
          { id: 'ALL', label: 'All Alerts', count: notifications.length },
          { id: 'GAPS', label: 'Gap Alerts', count: notifications.filter((n) => n.type === 'Gap Alert' || n.title.includes('Gap')).length },
          { id: 'TRAINING', label: 'Training Reminders', count: notifications.filter((n) => n.type === 'Training Assigned' || n.type === 'Training Reminder' || n.title.includes('Training')).length },
          { id: 'MENTORSHIP', label: 'Mentorship Reminders', count: notifications.filter((n) => n.type === 'Mentorship Reminder' || n.title.includes('Mentor') || n.title.includes('Session')).length },
          { id: 'ACHIEVEMENT', label: 'Learning Achievements', count: notifications.filter((n) => n.type === 'Learning Achievement' || n.type === 'Learning Milestone' || n.title.includes('Achievement')).length },
          { id: 'ASSESSMENT', label: 'Assessment Reminders', count: notifications.filter((n) => n.type === 'Assessment Reminder' || n.title.includes('Assessment')).length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              filterType === tab.id
                ? 'bg-[#0A7A74] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              filterType === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notification Stream */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">
            <div className="w-6 h-6 border-2 border-[#0A7A74] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading real-time notification feed...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-600">No notifications in this category.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">You're all caught up with your intelligence updates.</p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isGap = n.type === 'Gap Alert' || n.title.toLowerCase().includes('gap');
            const isMentorship = n.type === 'Mentorship Reminder' || n.title.toLowerCase().includes('mentor') || n.title.toLowerCase().includes('session');
            const isTraining = n.type === 'Training Assigned' || n.type === 'Training Reminder' || n.type === 'Recommendation Alert' || n.title.toLowerCase().includes('training');
            const isAchievement = n.type === 'Learning Achievement' || n.type === 'Learning Milestone' || n.type === 'Certificate Earned' || n.title.toLowerCase().includes('achievement');
            const isAssessment = n.type === 'Assessment Reminder' || n.title.toLowerCase().includes('assessment') || n.title.toLowerCase().includes('proficiency');

            return (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-4.5 flex flex-col sm:flex-row items-start gap-4 transition-all hover:bg-slate-50/70 cursor-pointer ${
                  !n.is_read ? 'bg-teal-50/30' : 'bg-white'
                }`}
              >
                {/* Icon Column */}
                <div className="shrink-0 mt-0.5">
                  {isGap ? (
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                      <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
                    </div>
                  ) : isMentorship ? (
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0A7A74] flex items-center justify-center border border-teal-200">
                      <Users className="w-5 h-5 stroke-[2.2]" />
                    </div>
                  ) : isAchievement ? (
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                      <Award className="w-5 h-5 stroke-[2.2]" />
                    </div>
                  ) : isTraining ? (
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                      <BookOpen className="w-5 h-5 stroke-[2.2]" />
                    </div>
                  ) : isAssessment ? (
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
                      <GraduationCap className="w-5 h-5 stroke-[2.2]" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
                      <Info className="w-5 h-5 stroke-[2.2]" />
                    </div>
                  )}
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isGap ? 'bg-rose-100 text-rose-700' :
                        isMentorship ? 'bg-teal-100 text-teal-800' :
                        isAchievement ? 'bg-amber-100 text-amber-800' :
                        isTraining ? 'bg-emerald-100 text-emerald-800' :
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        {n.type || 'Alert'}
                      </span>
                      <h3 className="font-bold text-slate-900 text-xs">{n.title}</h3>
                      {!n.is_read && (
                        <span className="px-2 py-0.2 rounded-full bg-[#0A7A74] text-white text-[9px] font-extrabold">
                          NEW
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-slate-600 mt-1.5 leading-relaxed text-xs">{n.message}</p>

                  {/* Channel Delivery Indicators */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Delivered via:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                      <Bell className="w-2.5 h-2.5 text-[#0A7A74]" />
                      <span>In-App</span>
                    </span>
                    {n.channels?.email?.sent !== false && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[10px] font-medium border border-teal-200">
                        <Mail className="w-2.5 h-2.5 text-teal-600" />
                        <span>Email (JavaMailSender)</span>
                      </span>
                    )}
                    {n.channels?.sms?.sent && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200">
                        <MessageSquare className="w-2.5 h-2.5 text-emerald-600" />
                        <span>SMS (Twilio)</span>
                      </span>
                    )}
                    {n.channels?.push?.sent !== false && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200">
                        <Smartphone className="w-2.5 h-2.5 text-amber-600" />
                        <span>Push (FCM)</span>
                      </span>
                    )}
                  </div>

                  {/* Action Link Footer */}
                  <div className="mt-3 flex items-center gap-3 pt-2 border-t border-slate-100">
                    {isGap && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/knowledge-gaps');
                        }}
                        className="text-[11px] font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>View Identified Skill Gap</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    {isMentorship && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/mentorship');
                        }}
                        className="text-[11px] font-bold text-[#0A7A74] hover:text-[#086963] flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>Open Mentorship Hub</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    {isTraining && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/trainings');
                        }}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>Continue Learning Module</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    {isAchievement && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/trainings');
                        }}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>View Milestone Progress</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    {isAssessment && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/assessments');
                        }}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>Take Assessment</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Multichannel Dispatch Simulator Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Module 10 Notification Dispatcher</h2>
                  <p className="text-[11px] text-slate-500">Test real-time delivery across Email, SMS, and Push</p>
                </div>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Presets */}
            <div className="mt-4">
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Official Example Presets:</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSimulatePreset('gap')}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold border border-rose-200 cursor-pointer"
                >
                  ⚠️ Gap Alert
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatePreset('training')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold border border-emerald-200 cursor-pointer"
                >
                  ⏳ Training Reminder
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatePreset('mentor')}
                  className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-[11px] font-semibold border border-teal-200 cursor-pointer"
                >
                  🤝 Mentorship Reminder
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatePreset('milestone')}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-[11px] font-semibold border border-amber-200 cursor-pointer"
                >
                  🚀 Learning Achievement
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatePreset('assessment')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold border border-indigo-200 cursor-pointer"
                >
                  📝 Assessment Reminder
                </button>
              </div>
            </div>

            <form onSubmit={handleDispatchCustom} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Notification Title</label>
                <input
                  type="text"
                  value={simTitle}
                  onChange={(e) => setSimTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0A7A74]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Alert Message</label>
                <textarea
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0A7A74]"
                  required
                />
              </div>

              {/* Channel Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Delivery Channels</label>
                <div className="grid grid-cols-3 gap-2">
                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    simChannelEmail ? 'bg-teal-50/60 border-teal-300 text-teal-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    <input
                      type="checkbox"
                      checked={simChannelEmail}
                      onChange={(e) => setSimChannelEmail(e.target.checked)}
                      className="rounded text-[#0A7A74]"
                    />
                    <Mail className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Email</span>
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    simChannelSms ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    <input
                      type="checkbox"
                      checked={simChannelSms}
                      onChange={(e) => setSimChannelSms(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="text-[11px]">SMS</span>
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    simChannelPush ? 'bg-amber-50/60 border-amber-300 text-amber-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    <input
                      type="checkbox"
                      checked={simChannelPush}
                      onChange={(e) => setSimChannelPush(e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Push (FCM)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingAlert}
                  className="px-4 py-2 rounded-xl bg-[#0A7A74] hover:bg-[#086963] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingAlert ? 'Dispatching...' : 'Dispatch Alert'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
