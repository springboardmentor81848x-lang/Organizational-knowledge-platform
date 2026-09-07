import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('okgip_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('okgip_token');
      localStorage.removeItem('okgip_role');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    if (error?.response?.status === 403 && window.location.pathname !== '/login') {
      console.warn('Forbidden access detected for OKGIP API call.', error?.response?.data);
    }

    return Promise.reject(error);
  },
);

export const endpoints = {
  login: '/api/auth/login',
  register: '/api/auth/register',
  profile: '/api/profile',
  skills: '/api/skills',
  skillMaster: '/api/master/skills',
  certifications: '/api/certification',
  education: '/api/education',
  experience: '/api/experience',
  jobRoles: '/api/master/job-roles',
  assignments: '/api/job-role-assignment',
  competencies: '/api/job-role-competencies',
  gaps: '/api/gap-analysis',
  trainings: '/api/trainings',
  adminTrainings: '/api/admin/trainings',
  trainingSkills: '/api/admin/training-skills',
  ai: '/api/ai',
  analytics: '/api/analytics',
  assessments: '/api/assessments',
  enrollments: '/api/training-enrollments',
  mentorship: '/api/mentorships',
  sessions: '/api/knowledge-sessions',
  resources: '/api/knowledge-resources',
  notifications: '/api/notifications',
  reports: '/api/reports',
  hr: '/api/hr',
  admin: '/api/admin',
};

export function getApiErrorMessage(error: any, fallback: string) {
  if (error?.response?.status === 401) {
    return 'Your session has expired. Please log in again.';
  }

  if (error?.response?.status === 403) {
    return 'You do not have permission to access this information.';
  }

  return error?.response?.data?.message || error?.message || fallback;
}

export const get = (url: string, config?: any) => api.get(url, config).then((response) => response.data);
export const post = (url: string, data?: any, config?: any) => api.post(url, data, config).then((response) => response.data);
export const put = (url: string, data?: any, config?: any) => api.put(url, data, config).then((response) => response.data);
export const del = (url: string, config?: any) => api.delete(url, config).then((response) => response.data);
