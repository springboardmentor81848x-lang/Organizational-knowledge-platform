import API from "@/api/axios";

export interface PendingEmployee { employeeId:number; employeeCode:string; firstName:string; lastName:string; officialEmail:string; }
export interface HRDashboardData {
  totalEmployees:number; pendingApprovals:number; employeesWithSkillGaps:number; criticalSkillGaps:number;
  employeesInTraining:number; trainingCompletionRate:number; averageLearningProgress:number; averageAssessmentScore:number; averageSkillImprovement:number;
  activeMentorships:number; totalSkills:number; totalSkillAssignments:number;
  departmentSummaries:Array<{departmentName:string;employeeCount:number;averageProficiency:number;averageGapPercentage:number}>;
  topSkillGaps:Array<{skillName:string;affectedEmployees:number;averageGapPercentage:number;severity:string}>;
  trainingStatus:Array<{status:string;count:number;percentage:number}>;
  assessmentSummary:Array<{assessmentType:string;attempts:number;averagePercentage:number}>;
  employeeGrowth:Array<{month:string;count:number}>;
}
export type HRRow = Record<string, any>;

export const hrService = {
  getDashboard: async () => (await API.get<HRDashboardData>("/hr/dashboard")).data,
  getPendingEmployees: async () => (await API.get<PendingEmployee[]>("/hr/pending")).data,
  approveEmployee: async (id:number) => (await API.put(`/hr/approve/${id}`)).data,
  rejectEmployee: async (id:number) => (await API.put(`/hr/reject/${id}`)).data,
  getEmployees: async () => (await API.get<HRRow[]>("/hr/employees")).data,
  getDepartments: async () => (await API.get<HRRow[]>("/hr/departments")).data,
  getJobRoles: async () => (await API.get<HRRow[]>("/hr/job-roles")).data,
  getWorkforceSkills: async () => (await API.get<HRRow[]>("/hr/workforce-skills")).data,
  getCompetencies: async () => (await API.get<HRRow[]>("/hr/competencies")).data,
  getKnowledgeGaps: async () => (await API.get<HRRow[]>("/hr/knowledge-gaps")).data,
  getTrainingAnalytics: async () => (await API.get<HRRow>("/hr/training-analytics")).data,
  getAssessments: async () => (await API.get<HRRow[]>("/hr/assessments")).data,
};
export default hrService;
