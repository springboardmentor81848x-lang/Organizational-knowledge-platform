import { mockApiResponse } from './axios';
import { mockEmployees } from '../data/mockData';

export const managerService = {
  getTeamMembers: async () => mockApiResponse(mockEmployees),
  getEmployeeDetails: async (employeeId) => {
    const emp = mockEmployees.find((e) => e.id === employeeId) || mockEmployees[0];
    return mockApiResponse(emp);
  },
  getTeamSkillGaps: async () =>
    mockApiResponse([
      { category: 'AI & Data Engineering', gapSeverity: 28, impactedMembers: 4 },
      { category: 'Cloud & Infrastructure', gapSeverity: 18, impactedMembers: 3 },
      { category: 'Security & Zero Trust', gapSeverity: 12, impactedMembers: 2 },
    ]),
};
