import API from "@/api/axios";

export interface Training {
  trainingId: number;
  trainingName: string;
  provider: string;
  duration: string;
  level: string;
  description: string;
  courseUrl: string;
}

export interface CreateTrainingRequest {
  trainingName: string;
  provider: string;
  duration: string;
  level: string;
  description: string;
  courseUrl: string;
}

export const trainingService = {
  getAllTrainings: async (): Promise<Training[]> => {
    const response = await API.get<Training[]>("/admin/trainings");
    return response.data;
  },

  getTrainingById: async (
    trainingId: number
  ): Promise<Training> => {
    const response = await API.get<Training>(
      `/admin/trainings/${trainingId}`
    );

    return response.data;
  },

  createTraining: async (
    data: CreateTrainingRequest
  ): Promise<Training> => {
    const response = await API.post<Training>(
      "/admin/trainings",
      data
    );

    return response.data;
  },

  updateTraining: async (
    trainingId: number,
    data: CreateTrainingRequest
  ): Promise<Training> => {
    const response = await API.put<Training>(
      `/admin/trainings/${trainingId}`,
      data
    );

    return response.data;
  },

  deleteTraining: async (
    trainingId: number
  ): Promise<void> => {
    await API.delete(`/admin/trainings/${trainingId}`);
  },
};

export default trainingService;