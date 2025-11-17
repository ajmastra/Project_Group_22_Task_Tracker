// src/services/authService.js
import axiosInstance from "../utils/axiosInstance";

const API = "/auth";

export const login = async ({ email, password }) => {
  const res = await axiosInstance.post(`${API}/login`, { email, password });
  return res.data; // expecting { token } or { token, user }
};

export const register = async ({ first_name, last_name, email, password }) => {
  const res = await axiosInstance.post(`${API}/register`, {
    first_name,
    last_name,
    email,
    password,
  });
  return res.data;
};

export const getProfile = async () => {
  const res = await axiosInstance.get(`${API}/profile`);
  // Backend returns: { success: true, data: { user: ... } }
  return res.data;
};

export default { login, register, getProfile };
