import api from "./axios";

/**
 * Register a new user with email and password
 * @param {{ email: string, password: string }} data
 * @returns {Promise<object>}
 */
export const registerRequest = async (data) => {
  const response = await api.post("/auth/register", data);
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

/**
 * Fetch comprehensive database analysis (16 tables, counts, columns, foreign keys)
 * @returns {Promise<object>}
 */
export const getDatabaseAnalysisRequest = async () => {
  const response = await api.get("/db/analysis");
  return response.data;
};
