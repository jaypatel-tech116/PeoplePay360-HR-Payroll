import api from "./axios";

/**
 * Register a new user with name, email, password, confirmPassword, and optional avatar
 * @param {FormData} formData
 * @returns {Promise<object>}
 */
export const registerRequest = async (formData) => {
  const response = await api.post("/auth/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * Log in with email and password
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<object>}
 */
export const loginRequest = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

/**
 * Invalidate authentication session and clear cookie
 * @returns {Promise<object>}
 */
export const logoutRequest = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

/**
 * Fetch current authenticated user info (used on initial page load / refresh)
 * @returns {Promise<object>}
 */
export const getCurrentUserRequest = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};
