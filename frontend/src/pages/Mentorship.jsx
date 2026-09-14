import React, { useState, useEffect } from 'react';
import {
  getMentors,
  saveMentor,
  getClasses,
  scheduleClass,
  enrollInClass,
  getSessions,
  requestSession,
  updateSessionStatus,
  getDoubts,
  submitDoubt,
  clarifyDoubt
} from '../services/mentorship';
import { getStoredUser, roleFamily } from '../services/platformApi';

const Mentorship = () => {
  const currentUser = getStoredUser();
  const currentRoleFamily = roleFamily(currentUser.role || currentUser.accountType || 'Employee');
  const userFullName = currentUser.name || 'John Doe';
  const userEmail = currentUser.email || 'employee@company.com';

  // Navigation & Filtering State
  const [activeTab, setActiveTab] = useState('mentors'); // 'mentors' | 'classes' | 'doubts' | 'sessions'
  const [deptFilter, setDeptFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Data Stores
  const [mentorsList, setMentorsList] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [sessionsList, setSessionsList] = useState([]);
  const [doubtsList, setDoubtsList] = useState([]);

  // Toast Notification
  const [toast, setToast] = useState(null);

  // Modal Open States
  const [showBecomeMentorModal, setShowBecomeMentorModal] = useState(false);
  const [selectedMentorForSession, setSelectedMentorForSession] = useState(null);
  const [showInformClassModal, setShowInformClassModal] = useState(false);
  const [showAskDoubtModal, setShowAskDoubtModal] = useState(false);
  const [selectedDoubtForClarify, setSelectedDoubtForClarify] = useState(null);
  const [activeVirtualRoom, setActiveVirtualRoom] = useState(null);

  // Form State: Become Mentor
  const [becomeMentorForm, setBecomeMentorForm] = useState({
    title: 'Senior Engineer',
    dept: 'Engineering',
    skills: 'React, Node.js, Cloud Architecture',
    bio: 'Passionate about guiding team members and sharing domain knowledge.',
    emoji: '🧑‍💻'
  });

  // Form State: Book 1-on-1 Session
  const [sessionForm, setSessionForm] = useState({
    date: '2026-08-29',
    time: '14:00 - 14:45 IST',
    format: '1-on-1 Code Review & Mentorship',
    topic: 'Architecture guidance & skill gap review',
    notes: 'Looking for advice on scaling microservices and improving backend query efficiency.'
  });

  // Form State: Inform/Schedule Class
  const [classForm, setClassForm] = useState({
    title: 'Advanced React Performance Optimization & Server Components',
    topic: 'Frontend Engineering',
    date: '2026-08-30',
    time: '15:00 - 16:30 IST',
    targetDept: 'Engineering',
    maxCapacity: 30,
    description: 'Interactive session exploring memory profiling, memoization strategies, and bundle size reduction techniques.'
  });

  // Form State: Ask a Doubt
  const [doubtForm, setDoubtForm] = useState({
    mentorId: '',
    skill: 'React.js',
    title: 'How to prevent unnecessary re-renders in deep component trees?',
    description: 'When updating state in a context provider, all child consumers re-render even if they only read an un-updated property.',
    codeSnippet: 'const MyContext = createContext();\nexport const Provider = ({children}) => {\n  const [state, setState] = useState({});\n  return <MyContext.Provider value={state}>{children}</MyContext.Provider>;\n};',
    urgency: 'Medium'
  });

  // Form State: Clarify Doubt Solution
  const [clarifyText, setClarifyText] = useState('');

  // Feedback Modal State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedFeedbackSession, setSelectedFeedbackSession] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('Excellent session! Very clear explanations.');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Virtual Room Interactive State
  const [roomMuted, setRoomMuted] = useState(false);
  const [roomCamOff, setRoomCamOff] = useState(false);
  const [roomChatMessages, setRoomChatMessages] = useState([
    { sender: 'System', text: 'Welcome to the live interactive session room!' },
    { sender: 'Host Mentor', text: 'Hello everyone! Feel free to drop questions in the chat or unmute.' }
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');

  // Initial Load
  const reloadData = () => {
    const mentors = getMentors();
    setMentorsList(mentors);
    setClassesList(getClasses());
    setSessionsList(getSessions());
    setDoubtsList(getDoubts());

    if (mentors.length > 0 && !doubtForm.mentorId) {
      setDoubtForm(prev => ({ ...prev, mentorId: mentors[0].id }));
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Handlers: Become Mentor
  const handleBecomeMentorSubmit = (e) => {
    e.preventDefault();
    if (!becomeMentorForm.title || !becomeMentorForm.skills) {
      alert('Please fill out all required fields');
      return;
    }
    const skillsArray = becomeMentorForm.skills.split(',').map(s => s.trim()).filter(Boolean);
    const newM = saveMentor({
      name: userFullName,
      email: userEmail,
      title: becomeMentorForm.title,
      dept: becomeMentorForm.dept,
      skills: skillsArray.length > 0 ? skillsArray : ['General Technology'],
      bio: becomeMentorForm.bio,
      emoji: becomeMentorForm.emoji
    });
    setMentorsList(getMentors());
    setShowBecomeMentorModal(false);
    triggerToast(`🎉 Success! You are now registered as an active Mentor!`);
  };

  // Handlers: Request Session
  const handleRequestSessionSubmit = (e) => {
    e.preventDefault();
    if (!selectedMentorForSession) return;

    requestSession({
      mentorId: selectedMentorForSession.id,
      mentorName: selectedMentorForSession.name,
      mentorAvatar: selectedMentorForSession.emoji,
      employeeName: userFullName,
      employeeEmail: userEmail,
      topic: sessionForm.topic,
      date: sessionForm.date,
      time: sessionForm.time,
      format: sessionForm.format,
      notes: sessionForm.notes
    });

    setSessionsList(getSessions());
    setSelectedMentorForSession(null);
    triggerToast(`📅 Session request sent to ${selectedMentorForSession.name}!`);
  };

  // Handlers: Inform/Schedule Class
  const handleInformClassSubmit = (e) => {
    e.preventDefault();
    if (!classForm.title || !classForm.topic) {
      alert('Please enter class title and topic');
      return;
    }

    const mentor = mentorsList.find(m => m.name === userFullName) || mentorsList[0];
    scheduleClass({
      mentorId: mentor ? mentor.id : 'm1',
      mentorName: mentor ? mentor.name : userFullName,
      mentorAvatar: mentor ? mentor.emoji : '👨‍🏫',
      title: classForm.title,
      topic: classForm.topic,
      date: classForm.date,
      time: classForm.time,
      targetDept: classForm.targetDept,
      maxCapacity: classForm.maxCapacity,
      description: classForm.description
    });

    setClassesList(getClasses());
    setShowInformClassModal(false);
    triggerToast(`📢 Class "${classForm.title}" broadcasted to employees!`);
  };

  // Handlers: Ask Doubt
  const handleAskDoubtSubmit = (e) => {
    e.preventDefault();
    if (!doubtForm.title || !doubtForm.description) {
      alert('Please enter doubt title and description');
      return;
    }

    const assignedMentor = mentorsList.find(m => m.id === doubtForm.mentorId) || mentorsList[0];

    submitDoubt({
      employeeName: userFullName,
      employeeEmail: userEmail,
      mentorId: assignedMentor ? assignedMentor.id : 'm1',
      mentorName: assignedMentor ? assignedMentor.name : 'Mentor',
      skill: doubtForm.skill,
      title: doubtForm.title,
      description: doubtForm.description,
      codeSnippet: doubtForm.codeSnippet,
      urgency: doubtForm.urgency
    });

    setDoubtsList(getDoubts());
    setShowAskDoubtModal(false);
    triggerToast(`❓ Your doubt has been submitted to ${assignedMentor ? assignedMentor.name : 'Mentor'}!`);
  };

  // Handlers: Clarify Doubt
  const handleClarifyDoubtSubmit = (e) => {
    e.preventDefault();
    if (!selectedDoubtForClarify || !clarifyText.trim()) {
      alert('Please write clarification response');
      return;
    }

    clarifyDoubt(selectedDoubtForClarify.id, clarifyText);
    setDoubtsList(getDoubts());
    setSelectedDoubtForClarify(null);
    setClarifyText('');
    triggerToast(`✅ Doubt answered & marked as Resolved!`);
  };

  // Handlers: Session Status Updates (Accept / Complete / Decline)
  const handleUpdateSessionStatus = (sessionId, status) => {
    updateSessionStatus(sessionId, status);
    setSessionsList(getSessions());
    triggerToast(`Session marked as ${status}!`);
  };

  // Handlers: Enroll in Group Class
  const handleEnrollClass = (cls) => {
    enrollInClass(cls.id, userFullName);
    setClassesList(getClasses());
    triggerToast(`🎉 Successfully enrolled in "${cls.title}"!`);
  };

  // Virtual Room Chat Send
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;
    setRoomChatMessages(prev => [
      ...prev,
      { sender: userFullName, text: newChatMessage.trim() }
    ]);
    setNewChatMessage('');
  };

  // Filtered Arrays
  const depts = ['All', 'Engineering', 'Data Science', 'Product', 'HR & Ops'];

  const filteredMentors = mentorsList.filter(m => {
    const matchesDept = deptFilter === 'All' || m.dept === deptFilter;
    const matchesSearch = !searchQuery ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  const filteredClasses = classesList.filter(c => {
    const matchesDept = deptFilter === 'All' || c.targetDept === deptFilter || c.targetDept === 'All Departments';
    const matchesSearch = !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mentorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const filteredDoubts = doubtsList.filter(d => {
    const matchesSearch = !searchQuery ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.mentorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredSessions = sessionsList.filter(s => {
    const matchesSearch = !searchQuery ||
      s.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mentorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const pendingDoubtsCount = doubtsList.filter(d => d.status === 'Pending Clarification').length;
  const scheduledClassesCount = classesList.filter(c => c.status === 'Scheduled').length;
  const activeSessionsCount = sessionsList.filter(s => s.status === 'Scheduled' || s.status === 'Requested').length;

  return (
    <div>
      {/* Toast Popup */}
      {toast && (
        <div className="toast-notification">
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="page-title">Mentorship & Interactive Learning Hub</div>
          <div className="page-sub">Connect with expert mentors, attend live classes, and get doubts clarified in real time</div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            style={{ padding: '0.6rem 1.25rem', borderRadius: 8 }}
            onClick={() => setShowBecomeMentorModal(true)}
          >
            🌟 Become a Mentor
          </button>
          <button
            className="btn-primary"
            style={{ padding: '0.6rem 1.25rem', borderRadius: 8, background: 'linear-gradient(135deg, #10b981, #059669)' }}
            onClick={() => setShowInformClassModal(true)}
          >
            📢 Inform Class
          </button>
          <button
            className="btn-primary"
            style={{ padding: '0.6rem 1.25rem', borderRadius: 8, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
            onClick={() => setShowAskDoubtModal(true)}
          >
            ❓ Clarify Doubts
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Active Expert Mentors', value: mentorsList.length, icon: '🧑‍🏫', sub: 'Available for 1-on-1s' },
          { label: 'Informed Group Classes', value: scheduledClassesCount, icon: '📢', sub: 'Upcoming webinars' },
          { label: 'Doubt Requests', value: pendingDoubtsCount, icon: '💬', sub: pendingDoubtsCount > 0 ? `${pendingDoubtsCount} pending answers` : 'All doubts cleared' },
          { label: 'Active Sessions', value: activeSessionsCount, icon: '📅', sub: 'Booked & Requested' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '1.15rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '1.6rem' }}>{s.icon}</span>
              <span className="stat-value" style={{ fontSize: '1.4rem' }}>{s.value}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.label}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="mentorship-nav-tabs">
        <button
          className={`mentorship-tab ${activeTab === 'mentors' ? 'active' : ''}`}
          onClick={() => setActiveTab('mentors')}
        >
          <span>👥 Expert Mentors Directory</span>
          <span className="mentorship-tab-badge">{mentorsList.length}</span>
        </button>

        <button
          className={`mentorship-tab ${activeTab === 'classes' ? 'active' : ''}`}
          onClick={() => setActiveTab('classes')}
        >
          <span>📢 Informed Classes & Workshops</span>
          <span className="mentorship-tab-badge" style={{ background: '#10b981' }}>{classesList.length}</span>
        </button>

        <button
          className={`mentorship-tab ${activeTab === 'doubts' ? 'active' : ''}`}
          onClick={() => setActiveTab('doubts')}
        >
          <span>💬 Doubt Clarification Center</span>
          {pendingDoubtsCount > 0 && <span className="mentorship-tab-badge" style={{ background: '#f59e0b' }}>{pendingDoubtsCount}</span>}
        </button>

        <button
          className={`mentorship-tab ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          <span>📅 My 1-on-1 Sessions</span>
          <span className="mentorship-tab-badge" style={{ background: '#8b5cf6' }}>{sessionsList.length}</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="filters-row" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {depts.map(d => (
            <button
              key={d}
              className={`filter-chip ${deptFilter === d ? 'active' : ''}`}
              onClick={() => setDeptFilter(d)}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="header-search" style={{ width: 280 }}>
          <span className="header-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search mentor, topic, skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* TAB 1: MENTORS DIRECTORY */}
      {activeTab === 'mentors' && (
        <div className="mentor-grid">
          {filteredMentors.map((m, i) => {
            const isCurrentUser = m.email === userEmail || m.name === userFullName;
            return (
              <div className="mentor-card" key={m.id || i} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="mentor-avatar" style={{ background: m.bg, border: isCurrentUser ? '2px solid #ec4899' : '2px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '2rem' }}>{m.emoji}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <div className="mentor-name">{m.name}</div>
                  {isCurrentUser && (
                    <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: 50, background: 'rgba(236,72,153,0.2)', color: '#ec4899', fontWeight: 700 }}>
                      YOU
                    </span>
                  )}
                  {m.available
                    ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} title="Available" />
                    : <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block' }} title="Unavailable" />
                  }
                </div>
                <div className="mentor-title">{m.title}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent)', marginTop: '4px', fontWeight: 600 }}>{m.dept}</div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.6rem 0', minHeight: 36, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {m.bio}
                </p>

                <div className="mentor-skills">
                  {m.skills.map(s => (
                    <span key={s} className="skill-pill">{s}</span>
                  ))}
                </div>

                <div className="mentor-rating">
                  {'⭐'.repeat(Math.round(m.rating))} {m.rating} · {m.sessions} sessions conducted
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn-connect"
                    disabled={!m.available}
                    onClick={() => setSelectedMentorForSession(m)}
                    style={!m.available ? { opacity: 0.5, cursor: 'not-allowed' } : { flex: 1 }}
                  >
                    {m.available ? '🔗 Request Session' : '⏳ Unavailable'}
                  </button>

                  <button
                    className="btn-connect"
                    onClick={() => {
                      setDoubtForm(prev => ({ ...prev, mentorId: m.id }));
                      setShowAskDoubtModal(true);
                    }}
                    style={{ flex: 1, borderColor: 'rgba(139,92,246,0.5)', color: '#c4b5fd' }}
                  >
                    ❓ Clarify Doubt
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: INFORMED CLASSES & WEBINARS */}
      {activeTab === 'classes' && (
        <div className="class-grid">
          {filteredClasses.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📢</div>
              <h3>No Informed Classes Found</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Mentors have not informed or scheduled any classes matching this filter.</p>
              <button className="btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => setShowInformClassModal(true)}>
                + Schedule New Class
              </button>
            </div>
          ) : (
            filteredClasses.map((c, i) => {
              const isEnrolled = (c.enrolledEmployees || []).includes(userFullName);
              return (
                <div key={c.id || i} className="mentor-class-card">
                  <div>
                    <div className="class-card-header">
                      <div className="class-mentor-avatar">{c.mentorAvatar || '👩‍💻'}</div>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700 }}>Informed by {c.mentorName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Target: {c.targetDept}</div>
                      </div>
                      <span className="tag new" style={{ marginLeft: 'auto' }}>{c.status}</span>
                    </div>

                    <div className="class-title">{c.title}</div>

                    <div className="class-meta-row">
                      <span>📅 {c.date}</span>
                      <span>⏱ {c.time}</span>
                      <span>👥 {(c.enrolledEmployees || []).length} / {c.maxCapacity} enrolled</span>
                    </div>

                    <p className="class-desc">{c.description}</p>
                  </div>

                  <div className="class-actions">
                    {isEnrolled ? (
                      <button
                        className="btn-primary"
                        style={{ flex: 1, background: 'linear-gradient(135deg,#10b981,#059669)' }}
                        onClick={() => setActiveVirtualRoom({ title: c.title, host: c.mentorName, meetingUrl: c.meetingUrl })}
                      >
                        🚀 Enter Class Room
                      </button>
                    ) : (
                      <button
                        className="btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => handleEnrollClass(c)}
                      >
                        ➕ Enroll in Class
                      </button>
                    )}

                    <button
                      className="btn-ghost"
                      style={{ padding: '0.55rem 0.85rem' }}
                      onClick={() => setActiveVirtualRoom({ title: c.title, host: c.mentorName, meetingUrl: c.meetingUrl })}
                    >
                      🔗 Join Link
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: DOUBT CLARIFICATION CENTER */}
      {activeTab === 'doubts' && (
        <div className="doubt-grid">
          {filteredDoubts.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              <h3>No Employee Doubts Found</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Ask a doubt or select another search query.</p>
              <button className="btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => setShowAskDoubtModal(true)}>
                ❓ Ask a Doubt Now
              </button>
            </div>
          ) : (
            filteredDoubts.map((d, i) => {
              const isResolved = d.status === 'Resolved';
              return (
                <div key={d.id || i} className={`doubt-card ${isResolved ? 'resolved' : 'pending'}`}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                      <span className="training-focus-pill" style={{ margin: 0 }}>Skill: {d.skill}</span>
                      <span className={`tag ${isResolved ? 'new' : d.urgency === 'High' ? 'urgent' : 'hot'}`}>
                        {isResolved ? '✅ Resolved' : `⏳ ${d.urgency} Urgency`}
                      </span>
                    </div>

                    <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>{d.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                      Asked by <strong style={{ color: 'var(--text-primary)' }}>{d.employeeName}</strong> to mentor <strong style={{ color: 'var(--accent)' }}>{d.mentorName}</strong>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                      {d.description}
                    </p>

                    {d.codeSnippet && (
                      <pre style={{ background: '#090d16', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: 8, fontSize: '0.78rem', color: '#a5b4fc', overflowX: 'auto', marginBottom: '0.85rem' }}>
                        <code>{d.codeSnippet}</code>
                      </pre>
                    )}

                    {isResolved && d.resolution && (
                      <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, padding: '0.85rem', marginBottom: '0.85rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.82rem', marginBottom: 4 }}>💡 Mentor Clarification:</div>
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{d.resolution}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Clarified on: {new Date(d.resolvedAt).toLocaleDateString()}</div>
                      </div>
                    )}
                  </div>

                  {!isResolved && (
                    <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--glass-border)' }}>
                      <button
                        className="btn-primary"
                        style={{ width: '100%', background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}
                        onClick={() => setSelectedDoubtForClarify(d)}
                      >
                        💡 Clarify Employee Doubt
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 4: MY 1-ON-1 SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="session-grid">
          {filteredSessions.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
              <h3>No 1-on-1 Sessions Found</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Request a 1-on-1 mentorship session with any mentor from the directory.</p>
              <button className="btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => setActiveTab('mentors')}>
                Browse Mentors Directory
              </button>
            </div>
          ) : (
            filteredSessions.map((s, i) => (
              <div key={s.id || i} className="session-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{s.mentorAvatar || '👩‍💻'}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.mentorName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mentee: {s.employeeName}</div>
                      </div>
                    </div>

                    <span className={`tag ${s.status === 'Scheduled' ? 'new' : s.status === 'Requested' ? 'hot' : 'urgent'}`}>
                      {s.status}
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>{s.topic}</div>
                  <div className="class-meta-row">
                    <span>🗓 Date: {s.date}</span>
                    <span>⏱ Slot: {s.time}</span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                    Format: <strong>{s.format}</strong>
                  </div>

                  {s.notes && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '0.6rem 0.8rem', borderRadius: 8, marginBottom: '1rem' }}>
                      Notes: {s.notes}
                    </div>
                  )}
                </div>

                <div className="class-actions">
                  {s.status === 'Requested' ? (
                    <>
                      <button
                        className="btn-primary"
                        style={{ flex: 1, background: 'linear-gradient(135deg,#10b981,#059669)' }}
                        onClick={() => handleUpdateSessionStatus(s.id, 'Scheduled')}
                      >
                        ✓ Accept
                      </button>
                      <button
                        className="btn-ghost"
                        style={{ flex: 1, color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }}
                        onClick={() => handleUpdateSessionStatus(s.id, 'Cancelled')}
                      >
                        ✕ Decline
                      </button>
                    </>
                  ) : s.status === 'Scheduled' ? (
                    <>
                      <button
                        className="btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => setActiveVirtualRoom({ title: s.topic, host: s.mentorName, meetingUrl: s.meetingUrl })}
                      >
                        🚀 Enter Meeting Room
                      </button>
                      <button
                        className="btn-ghost"
                        style={{ padding: '0.5rem 0.75rem' }}
                        onClick={() => handleUpdateSessionStatus(s.id, 'Completed')}
                      >
                        ✓ Complete
                      </button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
                      <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>✓ Completed</span>
                      <button
                        className="btn-ghost"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', marginLeft: 'auto', borderColor: '#a5b4fc', color: '#a5b4fc' }}
                        onClick={() => {
                          setSelectedFeedbackSession(s);
                          setShowFeedbackModal(true);
                        }}
                      >
                        ⭐ Leave Feedback
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL 1: BECOME A MENTOR */}
      {showBecomeMentorModal && (
        <div className="modal-overlay" onClick={() => setShowBecomeMentorModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🌟 Register as a Mentor</h2>
              <button className="modal-close-btn" onClick={() => setShowBecomeMentorModal(false)}>✕</button>
            </div>

            <form onSubmit={handleBecomeMentorSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input no-icon" type="text" value={userFullName} disabled />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Job Title / Role</label>
                  <input
                    className="form-input no-icon"
                    type="text"
                    required
                    value={becomeMentorForm.title}
                    onChange={(e) => setBecomeMentorForm({ ...becomeMentorForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    className="form-input no-icon"
                    value={becomeMentorForm.dept}
                    onChange={(e) => setBecomeMentorForm({ ...becomeMentorForm, dept: e.target.value })}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Product">Product</option>
                    <option value="HR & Ops">HR & Ops</option>
                    <option value="Security">Security</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Expertise & Skills (comma separated)</label>
                <input
                  className="form-input no-icon"
                  type="text"
                  required
                  placeholder="e.g. AWS, Kubernetes, React, Python"
                  value={becomeMentorForm.skills}
                  onChange={(e) => setBecomeMentorForm({ ...becomeMentorForm, skills: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bio / Mentorship Focus</label>
                <textarea
                  className="form-input no-icon"
                  rows="3"
                  value={becomeMentorForm.bio}
                  onChange={(e) => setBecomeMentorForm({ ...becomeMentorForm, bio: e.target.value })}
                />
              </div>

              <button className="btn-submit" type="submit" style={{ marginTop: '1rem' }}>
                🌟 Complete Mentor Registration
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REQUEST 1-ON-1 SESSION */}
      {selectedMentorForSession && (
        <div className="modal-overlay" onClick={() => setSelectedMentorForSession(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📅 Request Session with {selectedMentorForSession.name}</h2>
              <button className="modal-close-btn" onClick={() => setSelectedMentorForSession(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.85rem 1rem', borderRadius: 12, marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '2rem' }}>{selectedMentorForSession.emoji}</span>
              <div>
                <div style={{ fontWeight: 700 }}>{selectedMentorForSession.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{selectedMentorForSession.title} · {selectedMentorForSession.dept}</div>
              </div>
            </div>

            <form onSubmit={handleRequestSessionSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Preferred Date</label>
                  <input
                    className="form-input no-icon"
                    type="date"
                    required
                    value={sessionForm.date}
                    onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Time Slot</label>
                  <select
                    className="form-input no-icon"
                    value={sessionForm.time}
                    onChange={(e) => setSessionForm({ ...sessionForm, time: e.target.value })}
                  >
                    <option value="10:00 - 10:45 IST">10:00 - 10:45 IST</option>
                    <option value="11:30 - 12:15 IST">11:30 - 12:15 IST</option>
                    <option value="14:00 - 14:45 IST">14:00 - 14:45 IST</option>
                    <option value="16:00 - 16:45 IST">16:00 - 16:45 IST</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Session Format</label>
                <select
                  className="form-input no-icon"
                  value={sessionForm.format}
                  onChange={(e) => setSessionForm({ ...sessionForm, format: e.target.value })}
                >
                  <option value="1-on-1 Code Review & Mentorship">1-on-1 Code Review & Mentorship</option>
                  <option value="Career & Goal Alignment">Career & Goal Alignment</option>
                  <option value="Skill Gap Closing Session">Skill Gap Closing Session</option>
                  <option value="Project Architecture Review">Project Architecture Review</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Topic / Skill Gap</label>
                <input
                  className="form-input no-icon"
                  type="text"
                  required
                  value={sessionForm.topic}
                  onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Goals or Notes</label>
                <textarea
                  className="form-input no-icon"
                  rows="3"
                  value={sessionForm.notes}
                  onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                />
              </div>

              <button className="btn-submit" type="submit">
                🔗 Submit Session Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: INFORM / SCHEDULE CLASS */}
      {showInformClassModal && (
        <div className="modal-overlay" onClick={() => setShowInformClassModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📢 Inform & Schedule Group Class</h2>
              <button className="modal-close-btn" onClick={() => setShowInformClassModal(false)}>✕</button>
            </div>

            <form onSubmit={handleInformClassSubmit}>
              <div className="form-group">
                <label className="form-label">Class Title</label>
                <input
                  className="form-input no-icon"
                  type="text"
                  required
                  placeholder="e.g. Masterclass on Kubernetes Pod Autoscaling"
                  value={classForm.title}
                  onChange={(e) => setClassForm({ ...classForm, title: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Skill / Subject Focus</label>
                  <input
                    className="form-input no-icon"
                    type="text"
                    required
                    value={classForm.topic}
                    onChange={(e) => setClassForm({ ...classForm, topic: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Target Department</label>
                  <select
                    className="form-input no-icon"
                    value={classForm.targetDept}
                    onChange={(e) => setClassForm({ ...classForm, targetDept: e.target.value })}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Product">Product</option>
                    <option value="HR & Ops">HR & Ops</option>
                    <option value="All Departments">All Departments</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    className="form-input no-icon"
                    type="date"
                    required
                    value={classForm.date}
                    onChange={(e) => setClassForm({ ...classForm, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Time & Duration</label>
                  <input
                    className="form-input no-icon"
                    type="text"
                    required
                    value={classForm.time}
                    onChange={(e) => setClassForm({ ...classForm, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Class Outline & Description</label>
                <textarea
                  className="form-input no-icon"
                  rows="3"
                  value={classForm.description}
                  onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                />
              </div>

              <button className="btn-submit" type="submit" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                📢 Broadcast & Inform Class to Employees
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ASK A DOUBT */}
      {showAskDoubtModal && (
        <div className="modal-overlay" onClick={() => setShowAskDoubtModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>❓ Submit Doubt to Mentor</h2>
              <button className="modal-close-btn" onClick={() => setShowAskDoubtModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAskDoubtSubmit}>
              <div className="form-group">
                <label className="form-label">Choose Target Mentor</label>
                <select
                  className="form-input no-icon"
                  value={doubtForm.mentorId}
                  onChange={(e) => setDoubtForm({ ...doubtForm, mentorId: e.target.value })}
                >
                  {mentorsList.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.title} - {m.dept})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Skill / Area</label>
                  <input
                    className="form-input no-icon"
                    type="text"
                    required
                    value={doubtForm.skill}
                    onChange={(e) => setDoubtForm({ ...doubtForm, skill: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Urgency Level</label>
                  <select
                    className="form-input no-icon"
                    value={doubtForm.urgency}
                    onChange={(e) => setDoubtForm({ ...doubtForm, urgency: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Doubt Title / Core Question</label>
                <input
                  className="form-input no-icon"
                  type="text"
                  required
                  value={doubtForm.title}
                  onChange={(e) => setDoubtForm({ ...doubtForm, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Explanation</label>
                <textarea
                  className="form-input no-icon"
                  rows="3"
                  required
                  value={doubtForm.description}
                  onChange={(e) => setDoubtForm({ ...doubtForm, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Code Snippet / Config (Optional)</label>
                <textarea
                  className="form-input no-icon"
                  rows="3"
                  style={{ fontFamily: 'monospace' }}
                  value={doubtForm.codeSnippet}
                  onChange={(e) => setDoubtForm({ ...doubtForm, codeSnippet: e.target.value })}
                />
              </div>

              <button className="btn-submit" type="submit" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                ❓ Submit Doubt for Clarification
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: CLARIFY DOUBT (FOR MENTOR) */}
      {selectedDoubtForClarify && (
        <div className="modal-overlay" onClick={() => setSelectedDoubtForClarify(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💡 Clarify Employee Doubt</h2>
              <button className="modal-close-btn" onClick={() => setSelectedDoubtForClarify(null)}>✕</button>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 12, marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedDoubtForClarify.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent)', margin: '4px 0' }}>
                Asked by: {selectedDoubtForClarify.employeeName} · Skill: {selectedDoubtForClarify.skill}
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                {selectedDoubtForClarify.description}
              </p>
            </div>

            <form onSubmit={handleClarifyDoubtSubmit}>
              <div className="form-group">
                <label className="form-label">Clarification Answer & Guidelines</label>
                <textarea
                  className="form-input no-icon"
                  rows="4"
                  required
                  placeholder="Provide detailed solution, step-by-step guidance, or resource recommendations..."
                  value={clarifyText}
                  onChange={(e) => setClarifyText(e.target.value)}
                />
              </div>

              <button className="btn-submit" type="submit" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                ✅ Mark Doubt as Resolved
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: VIRTUAL MEETING ROOM SIMULATION */}
      {activeVirtualRoom && (
        <div className="modal-overlay" onClick={() => setActiveVirtualRoom(null)}>
          <div className="modal-content" style={{ maxWidth: 840, padding: 0 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1rem 1.5rem', background: '#0d1220', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'white' }}>🔴 LIVE: {activeVirtualRoom.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Host: {activeVirtualRoom.host} · KnowledgeIQ Virtual Room</div>
              </div>
              <button className="btn-ghost" style={{ padding: '0.4rem 0.8rem', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.4)' }} onClick={() => setActiveVirtualRoom(null)}>
                Leave Session
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', height: 380 }}>
              <div className="virtual-room-screen">
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#312e81,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', marginBottom: '1rem', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>
                  🎥
                </div>
                <div style={{ fontWeight: 700, color: 'white' }}>{activeVirtualRoom.host} (Presenter)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {roomCamOff ? 'Camera Turned Off' : 'Screen Sharing & Video Active'}
                </div>

                <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: 20, fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> 14 Participants
                </div>
              </div>

              {/* Chat Sidebar */}
              <div style={{ background: '#070b14', borderLeft: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--glass-border)', fontWeight: 700, fontSize: '0.85rem' }}>
                  💬 Session Chat
                </div>

                <div style={{ flex: 1, padding: '0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {roomChatMessages.map((m, idx) => (
                    <div key={idx} style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: 6 }}>
                      <strong style={{ color: 'var(--accent)' }}>{m.sender}: </strong>
                      <span style={{ color: 'var(--text-primary)' }}>{m.text}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChatMessage} style={{ padding: '0.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    placeholder="Send chat message..."
                    value={newChatMessage}
                    onChange={(e) => setNewChatMessage(e.target.value)}
                    style={{ flex: 1, background: '#0d1220', border: '1px solid var(--glass-border)', borderRadius: 6, padding: '0.4rem 0.6rem', color: 'white', fontSize: '0.78rem', outline: 'none' }}
                  />
                  <button className="btn-primary" type="submit" style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}>Send</button>
                </form>
              </div>
            </div>

            {/* Room Controls Bar */}
            <div className="virtual-room-controls">
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn-ghost"
                  onClick={() => setRoomMuted(!roomMuted)}
                  style={{ background: roomMuted ? 'rgba(239,68,68,0.2)' : 'transparent', color: roomMuted ? '#ef4444' : 'var(--text-primary)' }}
                >
                  {roomMuted ? '🎙️ Unmute' : '🎙️ Mute'}
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => setRoomCamOff(!roomCamOff)}
                  style={{ background: roomCamOff ? 'rgba(239,68,68,0.2)' : 'transparent', color: roomCamOff ? '#ef4444' : 'var(--text-primary)' }}
                >
                  {roomCamOff ? '📹 Turn On Cam' : '📹 Turn Off Cam'}
                </button>
              </div>

              <a
                href={activeVirtualRoom.meetingUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
              >
                🌐 Open Full Video Window (Jitsi / WebRTC)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SESSION FEEDBACK */}
      {showFeedbackModal && (
        <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⭐ Session Feedback & Review</h2>
              <button className="modal-close-btn" onClick={() => setShowFeedbackModal(false)}>✕</button>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Session topic: <strong>{selectedFeedbackSession?.topic}</strong> with <strong>{selectedFeedbackSession?.mentorName}</strong>
              </p>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Rating: {'⭐'.repeat(feedbackRating)} ({feedbackRating} / 5 Stars)</label>
                <input
                  type="range" min="1" max="5" value={feedbackRating}
                  onChange={(e) => setFeedbackRating(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#f59e0b' }}
                />
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Review / Key Takeaways</label>
                <textarea
                  className="form-input no-icon"
                  rows={3}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                />
              </div>

              {feedbackSubmitted ? (
                <div style={{ color: '#10b981', fontWeight: 700, margin: '1rem 0' }}>✓ Thank you! Your feedback has been recorded.</div>
              ) : (
                <button
                  className="btn-submit"
                  style={{ marginTop: '1rem' }}
                  onClick={() => {
                    setFeedbackSubmitted(true);
                    setTimeout(() => {
                      setFeedbackSubmitted(false);
                      setShowFeedbackModal(false);
                    }, 2000);
                  }}
                >
                  🚀 Submit Feedback
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mentorship;
