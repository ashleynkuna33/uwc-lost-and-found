
import { apiClient } from "../clients";
import { ENDPOINTS } from "../endpoints";

export const itemApi = {

  getAll: () => apiClient.get(ENDPOINTS.ITEMS.BASE),

  getById: (id) => apiClient.get(ENDPOINTS.ITEMS.BY_ID(id)),

  getByStatus: (status) => apiClient.get(ENDPOINTS.ITEMS.BY_STATUS(status.toUpperCase())),

  search: (name) => apiClient.get(ENDPOINTS.ITEMS.SEARCH, { params: { name }, }),

  create: (data) => apiClient.post(ENDPOINTS.ITEMS.BASE, data),

  update: (id, data) => apiClient.patch( ENDPOINTS.ITEMS.BY_ID(id), data ),

  delete: (id) => apiClient.delete(ENDPOINTS.ITEMS.BY_ID(id)),

};
