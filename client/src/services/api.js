import axiosInstance from "../utils/axiosInstance";

export const apiGet = (url) => axiosInstance.get(url);
export const apiPost = (url, data) => axiosInstance.post(url, data);
export const apiPut = (url, data) => axiosInstance.put(url, data);
export const apiDelete = (url) => axiosInstance.delete(url);
