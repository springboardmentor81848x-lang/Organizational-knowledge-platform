import api from "@/api/axios";

export interface Experience {
  experienceId: number;
  employeeCode?: string;
  companyName: string;
  designation: string;
  employmentType: string;
  startDate: string;
  endDate?: string | null;
  currentlyWorking: boolean;
  yearsOfExperience: number;
  jobDescription?: string;
}

export interface ExperienceRequest {
  companyName: string;
  designation: string;
  employmentType: string;
  startDate: string;
  endDate?: string | null;
  currentlyWorking: boolean;
  yearsOfExperience: number;
  jobDescription?: string;
}

const experienceService = {
  getMyExperiences: async (): Promise<Experience[]> => {
    const response = await api.get<Experience[]>("/experience");
    return response.data;
  },

  addExperience: async (
    data: ExperienceRequest
  ): Promise<Experience> => {
    const response = await api.post<Experience>(
      "/experience",
      data
    );
    return response.data;
  },

  updateExperience: async (
    experienceId: number,
    data: ExperienceRequest
  ): Promise<Experience> => {
    const response = await api.put<Experience>(
      `/experience/${experienceId}`,
      data
    );
    return response.data;
  },

  deleteExperience: async (
    experienceId: number
  ): Promise<string> => {
    const response = await api.delete<string>(
      `/experience/${experienceId}`
    );
    return response.data;
  },
};

export default experienceService;