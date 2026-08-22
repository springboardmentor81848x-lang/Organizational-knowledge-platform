import API from "@/api/axios";

export interface SelfAssessment {
  id?: number;
  assessmentId?: number;
  employeeId?: number;
  skillId?: number;
  skillName?: string;
  assessmentName?: string;
  proficiencyLevel?: string;
  score?: number;
  percentage?: number;
  status?: string;
  progress?: number;
  dueDate?: string;
  submittedAt?: string;
  completedAt?: string;
}

const selfAssessmentService = {
  getMyAssessments: async (): Promise<SelfAssessment[]> => {
    const response = await API.get<SelfAssessment[]>(
      "/self-assessments/my"
    );

    return response.data;
  },
};

export default selfAssessmentService;