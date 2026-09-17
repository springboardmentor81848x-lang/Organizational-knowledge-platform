import api from "@/api/axios";

export interface Training {
  trainingId: number;
  trainingName: string;
  provider: string;
  duration: string;
  level: string;
  description?: string;
  courseUrl?: string;
}

const trainingService = {
  getAvailableTrainings: async (): Promise<Training[]> => {
    const response = await api.get<Training[]>("/employee/trainings");
    return Array.isArray(response.data) ? response.data : [];
  },
};

export default trainingService;
