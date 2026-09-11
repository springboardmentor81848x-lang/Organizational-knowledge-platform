import { mockApiResponse } from './axios';
import {
  mockEmployees,
  mockDepartments,
  mockJobRoles,
  mockSkillsInventory,
  mockRecommendedCourses,
} from '../data/mockData';

export const hrService = {
  getUsers: async () => mockApiResponse(mockEmployees),
  getDepartments: async () => mockApiResponse(mockDepartments),
  getJobRoles: async () => mockApiResponse(mockJobRoles),
  getSkills: async () => mockApiResponse(mockSkillsInventory),
  getTrainingCatalog: async () => mockApiResponse(mockRecommendedCourses),
};
