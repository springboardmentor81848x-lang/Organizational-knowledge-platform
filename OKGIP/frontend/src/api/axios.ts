import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("okip_token");

    console.log("TOKEN FOUND:", !!token);
    console.log("REQUEST:", config.method?.toUpperCase(), config.url);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Authorization header attached");
    } else {
      console.warn("NO OKIP TOKEN FOUND");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    console.log(
      "API SUCCESS:",
      response.status,
      response.config.url
    );

    return response;
  },
  (error) => {
    console.error(
      "API ERROR:",
      error?.response?.status,
      error?.config?.url,
      error?.response?.data
    );

    return Promise.reject(error);
  }
);

export default API;