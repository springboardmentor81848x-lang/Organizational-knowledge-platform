import API from "@/api/axios";
import { AuthResponse, LoginCredentials } from "@/types/auth";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await API.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await API.post("/auth/logout");
    } catch {
      // Ignore failure on server logout
    } finally {
      localStorage.removeItem("okip_token");
      localStorage.removeItem("okip_role");
    }
  },
};