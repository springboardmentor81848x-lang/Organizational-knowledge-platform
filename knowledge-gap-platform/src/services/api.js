import axios from 'axios';
import {
  mockCurrentUser,
  mockSearchItems,
  mockNotifications,
  mockRecommendedCourses,
  mockSkillsInventory,
  mockTeamMembers,
  mockUsers,
  mockDepartments,
  mockJobRoles
} from './mockData';

// Axios Instance configured for Enterprise API integration
const api = axios.create({
  baseURL: 'https://api.knowledgegap-intelligence.enterprise.internal/v1',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Axios Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || 'mock-jwt-token-enterprise-2026';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Axios Response Interceptor with simulated error handling & log
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error Response:', error?.response || error.message);
    return Promise.reject(error);
  }
);

// Mock Helper to simulate realistic async network response with custom delay
const mockResponse = (data, delay = 250) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data, status: 200, statusText: 'OK' });
    }, delay);
  });
};

// API Services
export const authService = {
  login: async (credentials) => {
    // Simulated auth verification
    return mockResponse({
      user: {
        ...mockCurrentUser,
        role: credentials.role || 'employee',
        email: credentials.email || mockCurrentUser.email,
      },
      token: 'jwt-enterprise-token-xyz-987654',
    });
  },
  getCurrentUser: async () => mockResponse(mockCurrentUser),
  forgotPassword: async (email) => mockResponse({ success: true, message: `Password reset instructions dispatched to ${email}` }),
  resetPassword: async () => mockResponse({ success: true, message: 'Password updated successfully' }),
};

export const searchService = {
  query: async (term) => {
    if (!term || term.trim() === '') return mockResponse([]);
    const lower = term.toLowerCase();
    const results = mockSearchItems.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower) ||
        item.description.toLowerCase().includes(lower)
    );
    return mockResponse(results);
  },
};

export const notificationService = {
  getNotifications: async () => mockResponse(mockNotifications),
  markAsRead: async (id) => {
    const updated = mockNotifications.map(n => n.id === id ? { ...n, read: true } : n);
    return mockResponse(updated);
  },
};

export const skillService = {
  getSkills: async () => mockResponse(mockSkillsInventory),
  getAssessmentResults: async () => mockResponse({
    overallScore: 84,
    readinessIndex: "A- Grade",
    skillsEvaluated: mockSkillsInventory,
    strengths: ["React Architecture", "TypeScript Design", "GraphQL API Design"],
    primaryGapAreas: ["Generative AI RAG Implementation", "Kubernetes RBAC Policies", "System Security Modeling"],
    recommendedNextStep: "Enroll in Enterprise Generative AI & RAG Systems Architecture"
  }),
};

export const courseService = {
  getRecommendedCourses: async () => mockResponse(mockRecommendedCourses),
  getCourseById: async (id) => {
    const course = mockRecommendedCourses.find(c => c.id === id) || mockRecommendedCourses[0];
    return mockResponse(course);
  },
};

export const managerService = {
  getTeamMembers: async () => mockResponse(mockTeamMembers),
  getMemberById: async (id) => {
    const member = mockTeamMembers.find(m => m.id === id) || mockTeamMembers[0];
    return mockResponse(member);
  },
};

export const adminService = {
  getUsers: async () => mockResponse(mockUsers),
  getDepartments: async () => mockResponse(mockDepartments),
  getJobRoles: async () => mockResponse(mockJobRoles),
};

export default api;
