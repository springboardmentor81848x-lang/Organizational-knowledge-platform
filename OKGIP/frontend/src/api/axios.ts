import axios from "axios";
import { getStoredToken } from "@/utils/authStorage";

const API = axios.create({
baseURL: `${import.meta.env.VITE_API_URL}/api`,  timeout: 6g0000,
  headers: {
    "Content-Type": "application/json",
  },
});

// =====================================================
// JWT REQUEST INTERCEPTOR
// =====================================================

API.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    console.log("=================================");
    console.log("AXIOS REQUEST");
    console.log("URL:", config.url);
    console.log("TOKEN FOUND:", !!token);
    console.log("TOKEN LENGTH:", token?.length || 0);
    console.log("=================================");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ NO JWT TOKEN FOUND");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =====================================================
// RESPONSE ERROR HANDLER
// =====================================================

API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error(
      "API ERROR:",
      error.response?.status ?? "NETWORK/TIMEOUT",
      error.config?.url,
      error.code === "ECONNABORTED" ? "Request timed out" : ""
    );

    if (error.response?.status === 401) {
      console.error(
        "401 UNAUTHORIZED - JWT invalid or expired"
      );
    }

    if (error.response?.status === 403) {
      console.error(
        "403 FORBIDDEN - Authentication or role problem"
      );
    }

    return Promise.reject(error);
  }
);

export default API;