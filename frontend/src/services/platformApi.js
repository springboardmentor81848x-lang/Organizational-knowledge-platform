const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const COURSE_API_KEY = import.meta.env.VITE_COURSE_API_KEY || 'knowledge-platform-course-api-key';

const ROLE_FAMILIES = {
  employee: 'employee',
  manager: 'manager',
  teamlead: 'manager',
  team_lead: 'manager',
  team_lead_manager: 'manager',
  hr: 'hr',
  hr_specialist: 'hr',
  department_head: 'depthead',
  depthead: 'depthead',
  ld: 'learning',
  learning: 'learning',
  learning_development_admin_mentor: 'learning',
  system: 'system',
  admin: 'system',
  system_administrator: 'system',
};

const ROLE_PERMISSIONS = {
  Employee: [
    'view_self_dashboard',
    'maintain_profile',
    'self_assessment',
    'peer_assessment',
    'view_proficiency',
    'view_skill_gaps',
    'view_learning_paths',
    'enroll_training',
    'track_training_progress',
    'view_achievements',
    'manage_certifications',
    'mentorship',
    'notifications',
  ],
  'Team Lead / Manager': [
    'view_self_dashboard',
    'view_team_skill_coverage',
    'identify_team_skill_gaps',
    'identify_high_risk_gaps',
    'monitor_employee_progress',
    'monitor_training_adoption',
    'track_team_learning',
    'view_individual_progress',
    'recommend_interventions',
    'view_reports',
  ],
  'HR Specialist': [
    'organization_gap_intelligence',
    'workforce_skill_inventory',
    'training_effectiveness',
    'strategic_skill_forecasting',
    'user_management',
    'report_management',
    'security_overview',
  ],
  'Department Head': [
    'view_team_skill_coverage',
    'identify_team_skill_gaps',
    'identify_high_risk_gaps',
    'monitor_employee_progress',
    'monitor_training_adoption',
    'track_team_learning',
    'view_individual_progress',
    'recommend_interventions',
    'department_planning',
    'approve_knowledge',
    'set_learning_priorities',
    'review_team_reports',
    'identify_critical_skills',
  ],
  'Learning & Development Admin/mentor': [
    'training_catalog_management',
    'personalized_learning_paths',
    'training_recommendations',
    'recommendation_scoring',
    'adaptive_recommendations',
    'monitor_participation',
    'track_completion',
    'learning_effectiveness',
    'mentorship_support',
  ],
  'System Administrator': [
    'authentication',
    'role_management',
    'user_management',
    'system_monitoring',
    'security',
    'access_control',
  ],
};

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

export const saveSession = ({ token, user }) => {
  if (token) {
    localStorage.setItem('token', token);
  }

  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('enrolledCourses');
};

export const roleFamily = (role) => {
  const key = String(role || 'Employee')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return ROLE_FAMILIES[key] || 'employee';
};

export const defaultPermissionsForRole = (role) => ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.Employee;

export const buildAuthHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem('token');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
};

export const apiFetch = (path, options = {}) => {
  const headers = buildAuthHeaders(options.headers || {});

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
};

export const courseFetch = (path, options = {}) => {
  const headers = {
    ...(options.headers || {}),
    'X-API-KEY': COURSE_API_KEY,
  };

  return apiFetch(path, { ...options, headers });
};

export const refreshAuth = async (refreshToken) => {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) throw new Error('Refresh failed');
    return await res.json();
  } catch (err) {
    console.error('refreshAuth error', err);
    return null;
  }
};

export const revokeAuth = async (refreshToken) => {
  try {
    const res = await fetch(`${API_BASE}/auth/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    return res.ok;
  } catch (err) {
    console.error('revokeAuth error', err);
    return false;
  }
};

export const forgotPassword = async (email) => {
  try {
    const res = await fetch(`${API_BASE}/auth/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('forgot failed');
    return await res.json();
  } catch (err) {
    console.error('forgotPassword error', err);
    return null;
  }
};

export const resetPassword = async (token, password) => {
  try {
    const res = await fetch(`${API_BASE}/auth/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    if (!res.ok) throw new Error('reset failed');
    return await res.json();
  } catch (err) {
    console.error('resetPassword error', err);
    return null;
  }
};

// authFetch: wrapper that tries the request, and on 401 attempts to refresh token and retry once
export const authFetch = async (path, options = {}) => {
  const doFetch = async () => {
    const headers = buildAuthHeaders(options.headers || {});
    return fetch(`${API_BASE}${path}`, { ...options, headers });
  };

  let res = await doFetch();
  if (res.status !== 401) return res;

  // try refresh
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return res;
  const refreshed = await refreshAuth(refreshToken);
  if (!refreshed || !refreshed.token) return res;

  // save new tokens if present
  if (refreshed.token) localStorage.setItem('token', refreshed.token);
  if (refreshed.refreshToken) localStorage.setItem('refreshToken', refreshed.refreshToken);

  // retry original request once
  res = await doFetch();
  return res;
};

export { API_BASE, COURSE_API_KEY };