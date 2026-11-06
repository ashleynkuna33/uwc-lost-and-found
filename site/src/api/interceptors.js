// interceptors.js
import apiClient from "./client.js"; // 👈 CRITICAL FIX: Import your instance

export const setupInterceptors = () => {
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('sdk_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};
