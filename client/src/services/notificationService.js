import axiosInstance from "../utils/axiosInstance";

const API_BASE = "/notifications";

export const getNotifications = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.read_status !== undefined) {
    queryParams.append("read_status", params.read_status);
  }
  if (params.type) {
    queryParams.append("type", params.type);
  }
  if (params.page) {
    queryParams.append("page", params.page);
  }
  if (params.limit) {
    queryParams.append("limit", params.limit);
  }

  const url = queryParams.toString()
    ? `${API_BASE}?${queryParams.toString()}`
    : API_BASE;
  
  const response = await axiosInstance.get(url);
  return response.data;
};

export const getNotificationById = async (id) => {
  const response = await axiosInstance.get(`${API_BASE}/${id}`);
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await axiosInstance.patch(`${API_BASE}/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await axiosInstance.patch(`${API_BASE}/read-all`);
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await axiosInstance.delete(`${API_BASE}/${id}`);
  return response.data;
};

export default {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

