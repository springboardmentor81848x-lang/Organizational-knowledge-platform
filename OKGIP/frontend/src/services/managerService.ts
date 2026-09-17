import API from "@/api/axios";
import analyticsService, {
  TeamAnalytics,
} from "@/services/analyticsService";

/* ============================================================
   MASTER JOB ROLE
   ============================================================ */

export interface MasterJobRole {
  jobRoleId?: number;
  id?: number;
  jobRoleName?: string;
  name?: string;
  description?: string;
  [key: string]: any;
}

/* ============================================================
   MASTER SKILL
   ============================================================ */

export interface MasterSkill {
  skillId?: number;
  id?: number;
  skillName?: string;
  name?: string;
  skillCategory?: string;
  description?: string;
  [key: string]: any;
}

/* ============================================================
   TEAM SKILL GAP HEATMAP
   ============================================================ */

export interface SkillGapHeatmap {
  skillName: string;
  averageGapPercentage: number;
  employeeCount: number;
}

/* ============================================================
   RESPONSE ARRAY HELPER
   Supports:
   - []
   - { data: [] }
   - { items: [] }
   - { content: [] }
   - { results: [] }
   - { skills: [] }
   - { jobRoles: [] }
   - { employees: [] }
   - { team: [] }
   - { teamMembers: [] }
   ============================================================ */

const rows = <T,>(value: any): T[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const possibleKeys = [
    "data",
    "items",
    "content",
    "results",
    "skills",
    "jobRoles",
    "employees",
    "team",
    "teamMembers",
  ];

  for (const key of possibleKeys) {
    if (Array.isArray(value[key])) {
      return value[key];
    }
  }

  if (
    value.data &&
    typeof value.data === "object"
  ) {
    return rows<T>(value.data);
  }

  return [];
};

/* ============================================================
   MANAGER SERVICE
   ============================================================ */

const managerService = {


  /* ==========================================================
     MANAGER DASHBOARD
     ========================================================== */

  getManagerTeam: async (): Promise<TeamAnalytics[]> => {
    const response = await API.get("/manager/team");
    return rows<TeamAnalytics>(response.data);
  },

  getManagerHeatmap: async (): Promise<SkillGapHeatmap[]> => {
    const response = await API.get("/manager/team/skill-heatmap");
    return rows<SkillGapHeatmap>(response.data);
  },

  getManagerDepartments: async () => {
    const response = await API.get("/manager/departments");
    return rows<any>(response.data);
  },

  getTrainingAnalytics: async () => {
    const response = await API.get("/manager/training-analytics");
    return response.data;
  },

  getManagerTrainingAnalytics: async () => {
    const response = await API.get("/manager/training-analytics");
    return response.data;
  },

  getManagerDashboard: async () => {
    const response = await API.get("/manager/dashboard");
    return response.data;
  },

  getManagerAssessmentAnalytics: async () => {
    const response = await API.get("/manager/assessment-analytics");
    return response.data;
  },

  getManagerReport: async () => {
    const response = await API.get("/manager/reports");
    return response.data;
  },
  /* ==========================================================
     TEAM MANAGEMENT
     ========================================================== */

  getAvailableEmployees: async () => {
    const response = await API.get(
      "/manager/available-employees"
    );

    return rows<any>(response.data);
  },

  assignEmployeeToMyTeam: async (
    employeeId: number,
    jobRoleId: number,
    assignmentType: "PRIMARY" | "SECONDARY"
  ) => {
    const response = await API.post(
      "/manager/team/assign",
      {
        employeeId,
        jobRoleId,
        assignmentType,
      }
    );

    return response.data;
  },

  getMyTeam: async (): Promise<TeamAnalytics[]> => {
    const response = await API.get(
      "/manager/team"
    );

    return rows<TeamAnalytics>(response.data);
  },

  /* ==========================================================
     TEAM ANALYTICS
     ========================================================== */

  getTeamAnalytics: async (): Promise<TeamAnalytics[]> => {
    const response = await API.get("/manager/team");

    console.log(
      "MANAGER TEAM ANALYTICS RESPONSE:",
      response.data
    );

    return rows<TeamAnalytics>(response.data);
  },

  /* ==========================================================
     EMPLOYEE SUMMARY
     ========================================================== */

  getEmployeeSummary: async (
    employeeId: number
  ) => {
    const response =
      await analyticsService.getEmployeeSummary(
        employeeId
      );

    console.log(
      `MANAGER EMPLOYEE ${employeeId} SUMMARY RESPONSE:`,
      response
    );

    return response;
  },

  /* ==========================================================
     EMPLOYEE SKILL GAPS
     ========================================================== */

  getEmployeeSkillGaps: async (
    employeeId: number
  ) => {
    const response =
      await analyticsService.getEmployeeSkillGaps(
        employeeId
      );

    console.log(
      `MANAGER EMPLOYEE ${employeeId} SKILL GAPS RESPONSE:`,
      response
    );

    return response;
  },

  /* ==========================================================
     EMPLOYEE PROFICIENCY
     ========================================================== */

  getEmployeeProficiency: async (
    employeeId: number
  ) => {
    const response =
      await analyticsService.getEmployeeProficiency(
        employeeId
      );

    console.log(
      `MANAGER EMPLOYEE ${employeeId} PROFICIENCY RESPONSE:`,
      response
    );

    return response;
  },

  /* ==========================================================
     GAP ANALYSIS
     ========================================================== */

  runGapAnalysis: async (
    employeeId: number
  ) => {
    const response = await API.post(
      `/gap-analysis/run/${employeeId}`
    );

    return response.data;
  },

  getEmployeeGapAnalysis: async (
    employeeId: number
  ) => {
    const response = await API.get(
      `/gap-analysis/employee/${employeeId}`
    );

    return response.data;
  },

  getManagerGapAnalysis: async (employeeId: number) => {
    const response = await API.get(`/manager/employee/${employeeId}/gap-analysis`);
    return response.data;
  },

  runManagerGapAnalysis: async (employeeId: number) => {
    const response = await API.post(`/manager/employee/${employeeId}/gap-analysis/run`);
    return response.data;
  },

  /* ==========================================================
     JOB ROLE ASSIGNMENT
     ========================================================== */

  getJobRoleAssignments: async (
    employeeId: number
  ) => {
    const response = await API.get(
      `/job-role-assignment/employee/${employeeId}`
    );

    return response.data;
  },

  /* ==========================================================
     JOB ROLE MASTER
     ========================================================== */

  getJobRoles: async (): Promise<
    MasterJobRole[]
  > => {
    const response = await API.get(
      "/master/job-roles"
    );

    console.log(
      "MANAGER JOB ROLES RESPONSE:",
      response.data
    );

    return rows<MasterJobRole>(
      response.data
    );
  },

  /* ==========================================================
     SKILL MASTER
     ========================================================== */

  getSkills: async (): Promise<
    MasterSkill[]
  > => {
    const response = await API.get(
      "/master/skills"
    );

    console.log(
      "MANAGER SKILLS RESPONSE:",
      response.data
    );

    return rows<MasterSkill>(
      response.data
    );
  },

  /* ==========================================================
     JOB ROLE COMPETENCIES
     ========================================================== */

  getJobRoleCompetencies: async (
    jobRoleId: number
  ) => {
    const response = await API.get(
      `/job-role-competencies/${jobRoleId}`
    );

    console.log(
      `MANAGER JOB ROLE ${jobRoleId} COMPETENCIES RESPONSE:`,
      response.data
    );

    return response.data;
  },

  /* ==========================================================
     AI RECOMMENDATION
     ========================================================== */

  generateAiRecommendation: async (employeeId: number) => {
    const response = await API.post(
      `/ai/recommendation/${employeeId}`,
      undefined,
      { timeout: 60000 }
    );
    return response.data;
  },

  generateManagerRecommendation: async (employeeId: number) => {
    const response = await API.post(
      `/ai/recommendation/${employeeId}`,
      undefined,
      { timeout: 60000 }
    );
    return response.data;
  },

  /* ==========================================================
     TEAM SKILL GAP HEATMAP
     ========================================================== */

  getTeamSkillGapHeatmap:
    async (): Promise<SkillGapHeatmap[]> => {

      const response = await API.get(
        "/manager/team/skill-heatmap"
      );

      console.log(
        "MANAGER TEAM SKILL GAP HEATMAP RESPONSE:",
        response.data
      );

      return rows<SkillGapHeatmap>(
        response.data
      );
    },

  /* ==========================================================
     AI ROLE LEARNING PATH
     ========================================================== */

  getAiLearningPath: async (
    role: string
  ) => {
    const response = await API.get(
      "/ai/learning-path",
      {
        params: {
          role,
        },
      }
    );

    console.log(
      `AI LEARNING PATH FOR ${role}:`,
      response.data
    );

    return response.data;
  },
};

export default managerService;