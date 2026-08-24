import API from "@/api/axios";

export type AIRole =
  | "EMPLOYEE"
  | "MANAGER"
  | "HR"
  | "ADMIN";

const aiService = {

  /**
   * Generate AI learning/recommendation data
   * based on the selected application role.
   *
   * Kept for existing role-based APIs.
   */
  getLearningPath: async (role: AIRole) => {
    const response = await API.get("/ai/learning-path", {
      params: {
        role,
      },
    });

    return response.data;
  },

  /**
   * Employee-specific AI recommendation.
   *
   * Uses the currently authenticated employee ID.
   */
  getEmployeeRecommendations: async (employeeId: number) => {
    const response = await API.get(
      `/ai/employee/recommendations/${employeeId}`
    );

    return response.data;
  },

  /**
   * Manager-specific AI recommendation.
   */
  getManagerRecommendations: async () => {
    const response = await API.get(
      "/ai/manager/recommendations"
    );

    return response.data;
  },

  /**
   * HR-specific AI recommendation.
   */
  getHRRecommendations: async () => {
    const response = await API.get(
      "/ai/hr/recommendations"
    );

    return response.data;
  },

  /**
   * Admin-specific AI recommendation.
   */
  getAdminRecommendations: async () => {
    const response = await API.get(
      "/ai/admin/recommendations"
    );

    return response.data;
  },
};

export default aiService;
