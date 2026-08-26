import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================================================
// ADD JWT TOKEN TO EVERY REQUEST
// =========================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =========================================================
// HANDLE COMMON API ERRORS
// =========================================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized API request");

      // Do not immediately redirect here if your
      // Spring Security/JWT configuration handles it.
    }

    if (error.response?.status === 403) {
      console.error("Forbidden API request");
    }

    if (error.response?.status === 404) {
      console.error(
        "API endpoint not found:",
        error.config?.url
      );
    }

    return Promise.reject(error);
  }
);

export default api;