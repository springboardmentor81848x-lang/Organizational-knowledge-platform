import API from "@/api/axios";

export interface AnalyticsSummary {
  [key: string]: any;
}

export interface ProficiencyResponse {
  [key: string]: any;
}

export interface TeamAnalytics {
  employeeCode: string;
  employeeId: number;
  employeeName: string;
  gapPercentage: number;
  jobRoleName: string;
  readinessPercentage: number;
}

export interface DepartmentAnalytics {
  averageGapPercentage: number;
  averageReadinessPercentage: number;
  departmentName: string;
  employeeCount: number;
}

const analyticsService = {
  // Employee APIs
  getMySummary: async (): Promise<AnalyticsSummary> => {
    const response = await API.get<AnalyticsSummary>(
      "/analytics/my/summary"
    );
    return response.data;
  },

  getMySkillGaps: async () => {
    const response = await API.get("/analytics/my/skill-gaps");
    return response.data;
  },

  getMyProficiency: async (): Promise<ProficiencyResponse> => {
    const response = await API.get<ProficiencyResponse>(
      "/analytics/my/proficiency"
    );
    return response.data;
  },

  // Manager APIs
  getTeamAnalytics: async (): Promise<TeamAnalytics[]> => {
    const response = await API.get<TeamAnalytics[]>(
      "/analytics/team"
    );
    return response.data;
  },

  getDepartmentAnalytics: async (): Promise<DepartmentAnalytics[]> => {
    const response = await API.get<DepartmentAnalytics[]>(
      "/analytics/departments"
    );
    return response.data;
  },

  getEmployeeSkillGaps: async (employeeId: number) => {
    const response = await API.get(
      `/analytics/employee/${employeeId}/skill-gaps`
    );
    return response.data;
  },

  getEmployeeProficiency: async (employeeId: number) => {
    const response = await API.get(
      `/analytics/employee/${employeeId}/proficiency`
    );
    return response.data;
  },

  getEmployeeSummary: async (employeeId: number) => {
    const response = await API.get(
      `/analytics/employee/${employeeId}/summary`
    );
    return response.data;
  },
};

export default analyticsService;
export interface EmployeeAnalyticsSummary {
  [key: string]: any;
}

