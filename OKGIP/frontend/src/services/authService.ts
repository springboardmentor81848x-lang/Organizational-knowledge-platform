import API from "@/api/axios";
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from "@/types/auth";

export const authService = {
  // Normal email/password login
  login: async (
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    const response = await API.post<AuthResponse>("/auth/login", {
      officialEmail: credentials.email,
      password: credentials.password,
    });

    return response.data;
  },

  // Google Firebase login
  googleLogin: async (
    idToken: string
  ): Promise<AuthResponse> => {
    const response = await API.post<AuthResponse>(
      "/auth/google",
      {
        idToken,
      }
    );

    return response.data;
  },

  microsoftLogin: async (
  idToken: string
): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>(
    "/auth/microsoft",
    {
      idToken,
    }
  );

  return response.data;
},

  // Employee registration
  register: async (
    credentials: RegisterCredentials
  ) => {
    const response = await API.post("/auth/register", {
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      officialEmail: credentials.email,
      password: credentials.password,
      departmentId: Number(credentials.departmentId),
    });

    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    localStorage.removeItem("okip_token");
    localStorage.removeItem("okip_role");

    sessionStorage.removeItem("okip_token");
    sessionStorage.removeItem("okip_role");
  },
};