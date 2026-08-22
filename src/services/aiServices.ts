import API from "@/api/axios";

const aiService = {
  getMyLearningPath: async () => {
    const response = await API.get("/ai/learning-path");
    return response.data;
  },
};

export default aiService;