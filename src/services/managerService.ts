import API from "@/api/axios";
import analyticsService, {
  TeamAnalytics,
} from "@/services/analyticsService";

export interface MasterJobRole {
  jobRoleId?: number;
  id?: number;
  jobRoleName?: string;
  name?: string;
  description?: string;
  [key: string]: any;
}

export interface MasterSkill {
  skillId?: number;
  id?: number;
  skillName?: string;
  name?: string;
  skillCategory?: string;
  description?: string;
  [key: string]: any;
}

/**
 * Safely extracts array data from different backend response shapes.
 *
 * Supports:
 * [
 *   ...
 * ]
 *
 * {
 *   data: [...]
 * }
 *
 * {
 *   items: [...]
 * }
 *
 * {
 *   content: [...]
 * }
 *
 * {
 *   results: [...]
 * }
 */
const rows = <T,>(value: any): T[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  // Direct common response wrappers
  for (const key of [
    "data",
    "items",
    "content",
    "results",
    "skills",
    "jobRoles",
    "employees",
    "team",
    "teamMembers",
  ]) {
    if (Array.isArray(value[key])) {
      return value[key];
    }
  }

  // Handle nested response:
  // { data: { content: [...] } }
  if (value.data && typeof value.data === "object") {
    return rows<T>(value.data);
  }

  return [];
};

const managerService = {
  /**
   * ============================
   * TEAM ANALYTICS
   * ============================
   */

  getTeamAnalytics: async (): Promise<TeamAnalytics[]> => {
    const response = await analyticsService.getTeamAnalytics();

    console.log("MANAGER TEAM ANALYTICS RESPONSE:", response);

    return rows<TeamAnalytics>(response);
  },

  /**
   * ============================
   * EMPLOYEE ANALYTICS
   * ============================
   */

  getEmployeeSummary: async (employeeId: number) => {
    const response = await analyticsService.getEmployeeSummary(employeeId);

    console.log(
      `MANAGER EMPLOYEE ${employeeId} SUMMARY RESPONSE:`,
      response
    );

    return response;
  },

  getEmployeeSkillGaps: async (employeeId: number) => {
    const response =
      await analyticsService.getEmployeeSkillGaps(employeeId);

    console.log(
      `MANAGER EMPLOYEE ${employeeId} SKILL GAPS RESPONSE:`,
      response
    );

    return response;
  },

  getEmployeeProficiency: async (employeeId: number) => {
    const response =
      await analyticsService.getEmployeeProficiency(employeeId);

    console.log(
      `MANAGER EMPLOYEE ${employeeId} PROFICIENCY RESPONSE:`,
      response
    );

    return response;
  },

  /**
   * ============================
   * GAP ANALYSIS
   * ============================
   */

  runGapAnalysis: async (employeeId: number) => {
    const response = await API.post(
      `/gap-analysis/run/${employeeId}`
    );

    return response.data;
  },

  getEmployeeGapAnalysis: async (employeeId: number) => {
    const response = await API.get(
      `/gap-analysis/employee/${employeeId}`
    );

    return response.data;
  },

  /**
   * ============================
   * JOB ROLE ASSIGNMENT
   * ============================
   */

  getJobRoleAssignments: async (employeeId: number) => {
    const response = await API.get(
      `/job-role-assignment/employee/${employeeId}`
    );

    return response.data;
  },

  /**
   * ============================
   * JOB ROLE MASTER
   * ============================
   */

  getJobRoles: async (): Promise<MasterJobRole[]> => {
    const response = await API.get("/master/job-roles");

    console.log("MANAGER JOB ROLES RESPONSE:", response.data);

    return rows<MasterJobRole>(response.data);
  },

  /**
   * ============================
   * SKILL MASTER
   * ============================
   */

  getSkills: async (): Promise<MasterSkill[]> => {
    const response = await API.get("/master/skills");

    console.log("MANAGER SKILLS RESPONSE:", response.data);

    return rows<MasterSkill>(response.data);
  },

  /**
   * ============================
   * JOB ROLE COMPETENCIES
   * ============================
   */

  getJobRoleCompetencies: async (jobRoleId: number) => {
    const response = await API.get(
      `/job-role-competencies/${jobRoleId}`
    );

    return response.data;
  },
};

export default managerService;