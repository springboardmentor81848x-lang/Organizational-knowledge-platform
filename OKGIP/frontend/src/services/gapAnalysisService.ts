import API from "@/api/axios";

export interface KnowledgeGap {
  knowledgeGapId: number;
  employeeCode: string;
  employeeName: string;
  jobRoleName: string;
  skillName: string;
  currentProficiency: string | null;
  requiredProficiency: string | null;
  currentExperience: number;
  requiredExperience: number;
  gapType: string;
  gapScore: number;
  gapPercentage: number;
  status: string;
}

export interface GapAnalysisResponse {
  employeeCode: string;
  employeeName: string;
  jobRoleName: string;
  totalSkills: number;
  completedSkills: number;
  gapSkills: number;
  overallGapPercentage: number;
  readinessPercentage: number;
  knowledgeGaps: KnowledgeGap[];
}

export const gapAnalysisService = {
  getMyGapAnalysis: async (): Promise<GapAnalysisResponse> => {
    const response = await API.get<GapAnalysisResponse>(
      "/gap-analysis/my"
    );

    return response.data;
  },

  getEmployeeGapAnalysis: async (
    employeeId: number
  ): Promise<GapAnalysisResponse> => {
    const response = await API.get<GapAnalysisResponse>(
      `/gap-analysis/employee/${employeeId}`
    );

    return response.data;
  },

  runGapAnalysis: async (
    employeeId: number
  ) => {
    const response = await API.post(
      `/gap-analysis/run/${employeeId}`
    );

    return response.data;
  },
};

export default gapAnalysisService;