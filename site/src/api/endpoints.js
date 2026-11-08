export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
  },

  USERS: {
    ALL: "/users",
    ME: "/users/me",
  },

  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
  },

  ITEMS: {
    BASE: "/items",

    BY_ID: (id) =>
      `/items/${encodeURIComponent(id)}`,

    BY_STATUS: (status) =>
      `/items/status/${encodeURIComponent(status)}`,

    SEARCH: "/items/search",
  },

  
CLAIMS: {
  BASE: "/claims",

  MY: "/claims/my",

  BY_ID: (claimId) =>
    `/claims/${encodeURIComponent(claimId)}`,

  REVIEW: (claimId) =>
    `/claims/${encodeURIComponent(claimId)}/review`,

  EVIDENCE: (claimId) =>
    `/claims/${encodeURIComponent(claimId)}/evidence`,
},




};