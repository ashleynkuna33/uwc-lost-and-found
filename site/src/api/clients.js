// client.js
import axios from "axios";
import { setupInterceptors } from "./interceptors.js"; // 👈 Import the setup function

const apiClient = axios.create({
    baseURL: "http://localhost:8080/api",
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// 👈 CRITICAL FIX: Initialize the interceptors right after creating the client
setupInterceptors(); 

// Wrapper SDK functions exposed to your application
export const UserService = {
  getProfile: () => apiClient.get('/profile').then(res => res.data),
  updateProfile: (data) => apiClient.put('/profile', data).then(res => res.data)
};

export default apiClient; // 👈 Export so interceptors can see it
