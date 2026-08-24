import api from "@/api/axios";

const trainingService = {
  getAvailableTrainings: async () => {
    const response = await api.get(
      "/employee/trainings"
    );

    return response.data;
  },
};

export default trainingService;