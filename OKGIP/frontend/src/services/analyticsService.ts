import API from "@/api/axios";

export interface AnalyticsSummary {
  [key: string]: any;
}

export interface ProficiencyResponse {
  skillName: string;
  currentProficiency: string | null;
  requiredProficiency: string | null;
  currentExperience: number | null;
requiredExperience: number | null;
  proficiencyPercentage: number | null;
  assessmentScore: number | null;
  assessmentTotalMarks: number | null;
}

export interface TeamAnalytics {
  employeeCode: string;
  employeeId: number;
  employeeName: string;
  gapPercentage: number;
  jobRoleName: string;
  readinessPercentage: number;
  analysisStatus?: "READY" | "NOT_RUN" | "NO_COMPETENCIES" | string;
}

export interface DepartmentAnalytics {
  averageGapPercentage: number;
  averageReadinessPercentage: number;
  departmentName: string;
  employeeCount: number;
}

export interface SkillGapHeatmap {
  skillName: string;
  averageGapPercentage: number;
  employeeCount: number;
}

export interface EmployeeAnalyticsSummary {
  [key: string]: any;
}

const analyticsService = {
  getMySummary: async (): Promise<AnalyticsSummary> => {
    const response = await API.get<AnalyticsSummary>(
      "/analytics/my/summary"
    );

    return response.data;
  },

  getMySkillGaps: async () => {
    const response = await API.get(
      "/analytics/my/skill-gaps"
    );

    return response.data;
  },

  getMyProficiency: async (): Promise<ProficiencyResponse[]> => {
    const response = await API.get<ProficiencyResponse[]>(
      "/analytics/my/proficiency"
    );

    return response.data;
  },

  getTeamAnalytics: async (): Promise<TeamAnalytics[]> => {
    const response = await API.get<TeamAnalytics[]>(
      "/analytics/team"
    );

    return response.data;
  },

  getDepartmentAnalytics:
    async (): Promise<DepartmentAnalytics[]> => {
      const response =
        await API.get<DepartmentAnalytics[]>(
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

  getEmployeeProficiency: async (
    employeeId: number
  ) => {
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

  getTeamSkillGapHeatmap:
    async (): Promise<SkillGapHeatmap[]> => {
      const response =
        await API.get<SkillGapHeatmap[]>(
          "/analytics/team/skill-heatmap"
        );

      console.log(
        "TEAM SKILL GAP HEATMAP RESPONSE:",
        response.data
      );

      return Array.isArray(response.data)
        ? response.data
        : [];
    },
};

export default analyticsService;