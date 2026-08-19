import axios from "axios";
import { getStoredToken } from "@/utils/authStorage";

const API = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    console.log("TOKEN FOUND:", !!token);
    console.log("REQUEST URL:", config.url);

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;

      console.log("Authorization header attached");
    } else {
      console.warn("No JWT token found");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;