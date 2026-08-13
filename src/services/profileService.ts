import API from "@/api/axios";

export const profileService = {
  getProfile: async () => {
    // GET /api/profile
    const response = await API.get("/api/profile");
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    // PUT /api/profile
    const response = await API.put("/api/profile", profileData);
    return response.data;
  },

  createProfile: async (profileData: any) => {
    // POST /api/profile
    const response = await API.post("/api/profile", profileData);
    return response.data;
  },
};