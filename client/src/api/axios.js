import axios from "axios";

/**
 * Pre-configured Axios instance for application API requests
 * - baseURL points to Express backend /api
 * - withCredentials: true ensures httpOnly auth cookies are sent and received
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Bearer token from localStorage for Incognito / third-party cookie fallback
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
