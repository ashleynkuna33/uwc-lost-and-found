import { apiClient } from "../clients";
import { ENDPOINTS } from "../endpoints";

export const authApi = {
  login: (credentials) =>
    apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials),

  register: (data) =>
    apiClient.post(ENDPOINTS.AUTH.REGISTER, data),

  logout: () =>
    apiClient.post(ENDPOINTS.AUTH.LOGOUT),

  refresh: () =>
    apiClient.post(ENDPOINTS.AUTH.REFRESH),

  me: () =>
    apiClient.get(ENDPOINTS.AUTH.ME),
  
};