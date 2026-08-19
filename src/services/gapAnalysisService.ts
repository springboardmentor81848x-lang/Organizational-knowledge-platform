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

const gapAnalysisService = {
  getMyGapAnalysis: async (): Promise<GapAnalysisResponse> => {
    const response = await API.get<GapAnalysisResponse>(
      "/gap-analysis/my"
    );

    return response.data;
  },
};

export default gapAnalysisService;