import { apiFetch } from './platformApi';

const STORAGE_KEYS = {
  MENTORS: 'knowledgeiq_mentors',
  SESSIONS: 'knowledgeiq_sessions',
  CLASSES: 'knowledgeiq_classes',
  DOUBTS: 'knowledgeiq_doubts',
};

// Initial Seed Data
const INITIAL_MENTORS = [
  {
    id: 'm1',
    emoji: '👩‍💻',
    bg: 'linear-gradient(135deg,#312e81,#4c1d95)',
    name: 'Sarah Donovan',
    title: 'Principal Cloud Architect',
    dept: 'Engineering',
    skills: ['AWS', 'Azure', 'Kubernetes', 'Terraform'],
    rating: 4.9,
    sessions: 48,
    available: true,
    bio: '12+ years building enterprise cloud native architectures and Kubernetes clusters.',
    email: 'sarah.d@company.com'
  },
  {
    id: 'm2',
    emoji: '👨‍🔬',
    bg: 'linear-gradient(135deg,#064e3b,#065f46)',
    name: 'Dr. Rajan Mehta',
    title: 'Head of Data Science',
    dept: 'Data Science',
    skills: ['Python', 'ML', 'TensorFlow', 'Spark'],
    rating: 4.8,
    sessions: 62,
    available: true,
    bio: 'PhD in AI. Passionate about machine learning pipelines and real-time analytics.',
    email: 'rajan.m@company.com'
  },
  {
    id: 'm3',
    emoji: '👩‍🎨',
    bg: 'linear-gradient(135deg,#7f1d1d,#991b1b)',
    name: 'Priya Sharma',
    title: 'Sr. UX Research Lead',
    dept: 'Product',
    skills: ['UX', 'Figma', 'User Research', 'A/B Testing'],
    rating: 4.7,
    sessions: 35,
    available: false,
    bio: 'Specializing in design systems, accessibility, and user-centric web applications.',
    email: 'priya.s@company.com'
  },
  {
    id: 'm4',
    emoji: '👨‍💼',
    bg: 'linear-gradient(135deg,#1c1917,#44403c)',
    name: 'Michael Torres',
    title: 'VP of Product Strategy',
    dept: 'Product',
    skills: ['Product Vision', 'OKRs', 'Roadmapping', 'SQL'],
    rating: 4.9,
    sessions: 91,
    available: true,
    bio: 'Product strategist scaling high-growth SaaS tools and tech initiatives.',
    email: 'michael.t@company.com'
  },
  {
    id: 'm5',
    emoji: '👩‍🏫',
    bg: 'linear-gradient(135deg,#1e3a5f,#1d4ed8)',
    name: 'Aisha Williams',
    title: 'Learning & Development Lead',
    dept: 'HR & Ops',
    skills: ['L&D', 'Instructional Design', 'Coaching', 'LMS'],
    rating: 4.6,
    sessions: 27,
    available: true,
    bio: 'Empowering engineering and product teams through tailored learning paths.',
    email: 'aisha.w@company.com'
  },
  {
    id: 'm6',
    emoji: '👨‍🔧',
    bg: 'linear-gradient(135deg,#1a1f2e,#374151)',
    name: 'Chris Park',
    title: 'DevOps & SRE Engineer',
    dept: 'Engineering',
    skills: ['Docker', 'CI/CD', 'Prometheus', 'Golang'],
    rating: 4.8,
    sessions: 53,
    available: false,
    bio: 'Site reliability and continuous integration evangelist.',
    email: 'chris.p@company.com'
  },
];

const INITIAL_CLASSES = [
  {
    id: 'c1',
    mentorId: 'm1',
    mentorName: 'Sarah Donovan',
    mentorAvatar: '👩‍💻',
    title: 'Mastering Multi-Region AWS Infrastructure & VPC Peering',
    topic: 'Cloud Architecture & Terraform',
    date: '2026-08-28',
    time: '15:00 - 16:30 IST',
    targetDept: 'Engineering',
    meetingUrl: 'https://meet.jit.si/KnowledgeIQ-AWS-Masterclass',
    description: 'Hands-on class covering Terraform modules, multi-region failovers, and IAM best practices.',
    enrolledEmployees: ['Alice Smith', 'Bob Chen'],
    maxCapacity: 25,
    status: 'Scheduled',
    announcedAt: '2026-08-25T10:00:00Z'
  },
  {
    id: 'c2',
    mentorId: 'm2',
    mentorName: 'Dr. Rajan Mehta',
    mentorAvatar: '👨‍🔬',
    title: 'Building & Deploying Fine-Tuned LLMs using PyTorch',
    topic: 'Data Science & Generative AI',
    date: '2026-08-30',
    time: '11:00 - 12:30 IST',
    targetDept: 'Data Science',
    meetingUrl: 'https://meet.jit.si/KnowledgeIQ-LLM-Class',
    description: 'Deep dive into model quantization, LoRA tuning, and latency optimizations.',
    enrolledEmployees: ['Alice Smith'],
    maxCapacity: 30,
    status: 'Scheduled',
    announcedAt: '2026-08-24T14:30:00Z'
  }
];

const INITIAL_SESSIONS = [
  {
    id: 's1',
    mentorId: 'm1',
    mentorName: 'Sarah Donovan',
    mentorAvatar: '👩‍💻',
    employeeName: 'Alice Smith',
    employeeEmail: 'alice@company.com',
    topic: 'Kubernetes Cluster Setup & Ingress Controller Debugging',
    date: '2026-08-27',
    time: '14:00 - 14:45 IST',
    format: '1-on-1 Code Review',
    status: 'Scheduled', // Requested, Scheduled, Completed, Cancelled
    notes: 'Need help understanding NGINX ingress routing for microservices.',
    meetingUrl: 'https://meet.jit.si/KnowledgeIQ-Session-s1'
  },
  {
    id: 's2',
    mentorId: 'm4',
    mentorName: 'Michael Torres',
    mentorAvatar: '👨‍💼',
    employeeName: 'Bob Chen',
    employeeEmail: 'bob@company.com',
    topic: 'Product Roadmap Alignment & OKR Tracking',
    date: '2026-08-26',
    time: '16:00 - 16:30 IST',
    format: 'Career & Mentorship',
    status: 'Scheduled',
    notes: 'Reviewing quarterly goals for data analytics products.',
    meetingUrl: 'https://meet.jit.si/KnowledgeIQ-Session-s2'
  }
];

const INITIAL_DOUBTS = [
  {
    id: 'd1',
    employeeName: 'Alice Smith',
    employeeEmail: 'alice@company.com',
    mentorId: 'm1',
    mentorName: 'Sarah Donovan',
    skill: 'AWS Cloud',
    title: 'How to handle persistent storage volumes in Kubernetes EKS?',
    description: 'When updating stateful sets, the persistent volume claim locks up. How do we configure dynamic volume provisioning with AWS EBS CSI driver?',
    codeSnippet: 'kind: StorageClass\napiVersion: storage.k8s.io/v1\nmetadata:\n  name: ebs-sc\nprovisioner: ebs.csi.aws.com\nvolumeBindingMode: WaitForFirstConsumer',
    urgency: 'High',
    status: 'Pending Clarification', // Pending Clarification, Resolved
    createdAt: '2026-08-25T09:15:00Z',
    resolution: null,
    resolvedAt: null
  },
  {
    id: 'd2',
    employeeName: 'Bob Chen',
    employeeEmail: 'bob@company.com',
    mentorId: 'm2',
    mentorName: 'Dr. Rajan Mehta',
    skill: 'Machine Learning',
    title: 'Difference between L1 and L2 Regularization in Spark MLlib',
    description: 'Getting overfitting in linear regression pipeline. Should I use ElasticNet parameter elasticNetParam=0.5 or pure L2?',
    codeSnippet: 'val lr = new LinearRegression()\n  .setMaxIter(10)\n  .setRegParam(0.3)\n  .setElasticNetParam(0.8)',
    urgency: 'Medium',
    status: 'Resolved',
    createdAt: '2026-08-24T16:20:00Z',
    resolution: 'Use ElasticNet with elasticNetParam closer to 0.5 to balance feature selection (L1) and stability (L2). Also normalize features before training.',
    resolvedAt: '2026-08-25T11:00:00Z'
  }
];

// Helper functions for localStorage
export const getMentors = () => {
  const data = localStorage.getItem(STORAGE_KEYS.MENTORS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.MENTORS, JSON.stringify(INITIAL_MENTORS));
    return INITIAL_MENTORS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_MENTORS;
  }
};

export const saveMentor = (mentorData) => {
  const mentors = getMentors();
  const newMentor = {
    id: 'm_' + Date.now(),
    emoji: mentorData.emoji || '👨‍🏫',
    bg: mentorData.bg || 'linear-gradient(135deg,#312e81,#4c1d95)',
    name: mentorData.name,
    title: mentorData.title,
    dept: mentorData.dept,
    skills: mentorData.skills || [],
    rating: 5.0,
    sessions: 0,
    available: true,
    bio: mentorData.bio || 'Experienced mentor ready to assist employees.',
    email: mentorData.email || ''
  };
  const updated = [newMentor, ...mentors];
  localStorage.setItem(STORAGE_KEYS.MENTORS, JSON.stringify(updated));
  return newMentor;
};

export const getClasses = () => {
  const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
    return INITIAL_CLASSES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_CLASSES;
  }
};

export const scheduleClass = (classData) => {
  const classes = getClasses();
  const newClass = {
    id: 'c_' + Date.now(),
    mentorId: classData.mentorId || 'm1',
    mentorName: classData.mentorName || 'Mentor',
    mentorAvatar: classData.mentorAvatar || '👨‍🏫',
    title: classData.title,
    topic: classData.topic,
    date: classData.date,
    time: classData.time,
    targetDept: classData.targetDept || 'All Departments',
    meetingUrl: classData.meetingUrl || `https://meet.jit.si/KnowledgeIQ-Class-${Date.now()}`,
    description: classData.description || '',
    enrolledEmployees: [],
    maxCapacity: Number(classData.maxCapacity) || 30,
    status: 'Scheduled',
    announcedAt: new Date().toISOString()
  };
  const updated = [newClass, ...classes];
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(updated));
  return newClass;
};

export const enrollInClass = (classId, employeeName) => {
  const classes = getClasses();
  const updated = classes.map(c => {
    if (c.id === classId) {
      const enrolled = c.enrolledEmployees || [];
      if (!enrolled.includes(employeeName)) {
        return { ...c, enrolledEmployees: [...enrolled, employeeName] };
      }
    }
    return c;
  });
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(updated));
  return updated;
};

export const getSessions = () => {
  const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
    return INITIAL_SESSIONS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SESSIONS;
  }
};

export const requestSession = async (sessionData) => {
  const sessions = getSessions();
  const newSession = {
    id: 's_' + Date.now(),
    mentorId: sessionData.mentorId,
    mentorName: sessionData.mentorName,
    mentorAvatar: sessionData.mentorAvatar || '👨‍🏫',
    employeeName: sessionData.employeeName,
    employeeEmail: sessionData.employeeEmail,
    topic: sessionData.topic,
    date: sessionData.date,
    time: sessionData.time,
    format: sessionData.format || '1-on-1 Mentorship',
    status: 'Requested',
    notes: sessionData.notes || '',
    meetingUrl: `https://meet.jit.si/KnowledgeIQ-Session-${Date.now()}`
  };
  const updated = [newSession, ...sessions];
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));

  // Sync to Spring Boot database API
  try {
    await apiFetch('/mentorship/sessions', {
      method: 'POST',
      body: JSON.stringify(newSession)
    });
  } catch (e) {
    console.error('Failed to sync mentorship session with Spring Boot backend', e);
  }

  return newSession;
};

export const updateSessionStatus = async (sessionId, status) => {
  const sessions = getSessions();
  const updated = sessions.map(s => s.id === sessionId ? { ...s, status } : s);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));

  try {
    await apiFetch(`/mentorship/sessions/${sessionId}/status?status=${encodeURIComponent(status)}`, {
      method: 'PUT'
    });
  } catch (e) {
    console.error('Failed to sync session status update with backend', e);
  }

  return updated;
};

export const getDoubts = () => {
  const data = localStorage.getItem(STORAGE_KEYS.DOUBTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.DOUBTS, JSON.stringify(INITIAL_DOUBTS));
    return INITIAL_DOUBTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_DOUBTS;
  }
};

export const submitDoubt = (doubtData) => {
  const doubts = getDoubts();
  const newDoubt = {
    id: 'd_' + Date.now(),
    employeeName: doubtData.employeeName,
    employeeEmail: doubtData.employeeEmail,
    mentorId: doubtData.mentorId,
    mentorName: doubtData.mentorName,
    skill: doubtData.skill || 'General',
    title: doubtData.title,
    description: doubtData.description,
    codeSnippet: doubtData.codeSnippet || '',
    urgency: doubtData.urgency || 'Medium',
    status: 'Pending Clarification',
    createdAt: new Date().toISOString(),
    resolution: null,
    resolvedAt: null
  };
  const updated = [newDoubt, ...doubts];
  localStorage.setItem(STORAGE_KEYS.DOUBTS, JSON.stringify(updated));
  return newDoubt;
};

export const clarifyDoubt = (doubtId, resolutionText) => {
  const doubts = getDoubts();
  const updated = doubts.map(d => {
    if (d.id === doubtId) {
      return {
        ...d,
        status: 'Resolved',
        resolution: resolutionText,
        resolvedAt: new Date().toISOString()
      };
    }
    return d;
  });
  localStorage.setItem(STORAGE_KEYS.DOUBTS, JSON.stringify(updated));
  return updated;
};
