import axiosInstance from "../utils/axiosInstance";

const API_BASE = "/analytics";

export const getDashboardSummary = async () => {
  const response = await axiosInstance.get(`${API_BASE}/dashboard-summary`);
  return response.data;
};

export const getTasksByStatus = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.start_date) {
    queryParams.append("start_date", params.start_date);
  }
  if (params.end_date) {
    queryParams.append("end_date", params.end_date);
  }
  
  const url = queryParams.toString()
    ? `${API_BASE}/tasks-by-status?${queryParams.toString()}`
    : `${API_BASE}/tasks-by-status`;
  
  const response = await axiosInstance.get(url);
  return response.data;
};

export const getTasksByPriority = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.start_date) {
    queryParams.append("start_date", params.start_date);
  }
  if (params.end_date) {
    queryParams.append("end_date", params.end_date);
  }
  
  const url = queryParams.toString()
    ? `${API_BASE}/tasks-by-priority?${queryParams.toString()}`
    : `${API_BASE}/tasks-by-priority`;
  
  const response = await axiosInstance.get(url);
  return response.data;
};

export const getCompletionRate = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.period) {
    queryParams.append("period", params.period);
  }
  if (params.start_date) {
    queryParams.append("start_date", params.start_date);
  }
  if (params.end_date) {
    queryParams.append("end_date", params.end_date);
  }
  
  const url = queryParams.toString()
    ? `${API_BASE}/completion-rate?${queryParams.toString()}`
    : `${API_BASE}/completion-rate`;
  
  const response = await axiosInstance.get(url);
  return response.data;
};

export default {
  getDashboardSummary,
  getTasksByStatus,
  getTasksByPriority,
  getCompletionRate,
};

