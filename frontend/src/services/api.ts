import axios from "axios";
import { getStoredToken } from "@/utils/authStorage";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

const api = axios.create({
  baseURL: configuredBaseUrl || "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
