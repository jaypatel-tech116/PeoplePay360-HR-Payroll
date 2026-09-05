import api from "./axios";

/**
 * Fetch authenticated user profile
 * @returns {Promise<object>}
 */
export const getProfileRequest = async () => {
  const response = await api.get("/user/profile");
  return response.data;
};

/**
 * Update authenticated user name, email, and/or upload & replace avatar
 * @param {FormData} formData
 * @returns {Promise<object>}
 */
export const updateProfileRequest = async (formData) => {
  const response = await api.put("/user/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
