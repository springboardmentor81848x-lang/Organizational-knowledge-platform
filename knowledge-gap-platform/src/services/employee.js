import { mockApiResponse } from './axios';
import {
  mockSkillsInventory,
  mockRecommendedCourses,
  mockMentors,
  mockNotifications,
} from '../data/mockData';

export const employeeService = {
  getSkills: async () => mockApiResponse(mockSkillsInventory),
  getAssessmentResults: async () =>
    mockApiResponse({
      overallScore: 84,
      grade: 'A- Grade',
      evaluations: mockSkillsInventory,
      strengths: ['React 19 & Next.js Architecture', 'TypeScript Metaprogramming', 'GraphQL Schema Federation'],
      criticalGaps: ['Generative AI RAG Implementation', 'Kubernetes RBAC Policies', 'System Security Zero Trust'],
    }),
  getAIRecommendations: async () => mockApiResponse(mockRecommendedCourses),
  getCourseDetails: async (courseId) => {
    const course = mockRecommendedCourses.find((c) => c.id === courseId) || mockRecommendedCourses[0];
    return mockApiResponse(course);
  },
  getMentors: async () => mockApiResponse(mockMentors),
  getNotifications: async () => mockApiResponse(mockNotifications),
};
