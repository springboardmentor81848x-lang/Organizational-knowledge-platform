import api from "./api";

export const login = async (data) => {
  return await api.post("/auth/login", data);
};

export const signup = async (data) => {
  return await api.post("/auth/signup", data);
};
