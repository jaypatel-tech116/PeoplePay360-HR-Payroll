import api from "./axios";

/**
 * Employee Self-Service Portal API Client
 * Interacts with /api/employee/me/* backend routes
 */

export const getEmployeeDashboard = async () => {
  const res = await api.get("/employee/me/dashboard");
  return res.data;
};

export const getEmployeeProfile = async () => {
  const res = await api.get("/employee/me/profile");
  return res.data;
};

export const updateEmployeeProfile = async (data) => {
  const res = await api.patch("/employee/me/profile", data);
  return res.data;
};

export const getEmployeeContract = async () => {
  const res = await api.get("/employee/me/contract");
  return res.data;
};

export const getEmployeeSchedule = async () => {
  const res = await api.get("/employee/me/schedule");
  return res.data;
};

export const getEmployeeAttendance = async (params = {}) => {
  const res = await api.get("/employee/me/attendance", { params });
  return res.data;
};

export const punchAttendance = async () => {
  const res = await api.post("/employee/me/attendance/punch");
  return res.data;
};

export const getEmployeeLeaves = async (params = {}) => {
  const res = await api.get("/employee/me/leaves", { params });
  return res.data;
};

export const submitLeaveRequest = async (data) => {
  const res = await api.post("/employee/me/leaves", data);
  return res.data;
};

export const getEmployeePayslips = async (params = {}) => {
  const res = await api.get("/employee/me/payslips", { params });
  return res.data;
};

export const getPayslipDetails = async (id) => {
  const res = await api.get(`/employee/me/payslips/${id}`);
  return res.data;
};
