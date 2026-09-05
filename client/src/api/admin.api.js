import api from "./axios";

/**
 * 1. Admin Dashboard Analytics & Overview
 */
export const getAdminOverview = async () => {
  const response = await api.get("/analytics/admin");
  return response.data?.data || response.data;
};

/**
 * 2. Employees Management
 */
export const getEmployees = async (params) => {
  const response = await api.get("/employees", { params });
  return response.data?.data?.employees || [];
};

export const getEmployeeById = async (id) => {
  const response = await api.get(`/employees/${id}`);
  return response.data?.data?.employee || response.data;
};

export const createEmployee = async (data) => {
  const response = await api.post("/employees", data);
  return response.data?.data?.employee || response.data;
};

export const updateEmployee = async (id, data) => {
  const response = await api.put(`/employees/${id}`, data);
  return response.data?.data?.employee || response.data;
};

export const deleteEmployee = async (id) => {
  const response = await api.delete(`/employees/${id}`);
  return response.data;
};

/**
 * 3. Departments Management
 */
export const getDepartments = async () => {
  const response = await api.get("/departments");
  return response.data?.data?.departments || [];
};

export const createDepartment = async (data) => {
  const response = await api.post("/departments", data);
  return response.data?.data?.department || response.data;
};

export const updateDepartment = async (id, data) => {
  const response = await api.put(`/departments/${id}`, data);
  return response.data?.data?.department || response.data;
};

/**
 * 4. Contracts Management
 */
export const getContracts = async (params) => {
  const response = await api.get("/contracts", { params });
  return response.data?.data?.contracts || [];
};

export const createContract = async (data) => {
  const response = await api.post("/contracts", data);
  return response.data?.data?.contract || response.data;
};

export const updateContract = async (id, data) => {
  const response = await api.put(`/contracts/${id}`, data);
  return response.data?.data?.contract || response.data;
};

/**
 * 5. Working Schedules
 */
export const getWorkingSchedules = async () => {
  const response = await api.get("/schedules");
  return response.data?.data?.schedules || [];
};

export const createWorkingSchedule = async (data) => {
  const response = await api.post("/schedules", data);
  return response.data?.data?.schedule || response.data;
};

/**
 * 6. Attendance
 */
export const getAttendance = async (params) => {
  const response = await api.get("/attendance", { params });
  return response.data?.data?.attendance || [];
};

/**
 * 7. Time Off (Leave Requests)
 */
export const getTimeOffRequests = async (params) => {
  const response = await api.get("/leaves/requests", { params });
  return response.data?.data?.requests || [];
};

export const updateTimeOffStatus = async (id, data) => {
  const response = await api.patch(`/leaves/requests/${id}/status`, data);
  return response.data?.data?.request || response.data;
};

/**
 * 8. Payroll & Pay Cycles
 */
export const getPayCycles = async (params) => {
  const response = await api.get("/payroll/payruns", { params });
  return response.data?.data?.payruns || [];
};

export const createPayCycle = async (data) => {
  const response = await api.post("/payroll/payruns", data);
  return response.data?.data?.payrun || response.data;
};

export const computePayCycle = async (id) => {
  const response = await api.post(`/payroll/payruns/${id}/compute`);
  return response.data?.data?.payrun || response.data;
};

export const validatePayCycle = async (id) => {
  const response = await api.post(`/payroll/payruns/${id}/validate`);
  return response.data?.data?.payrun || response.data;
};

export const getPaySlips = async (params) => {
  const response = await api.get("/payroll/payslips", { params });
  return response.data?.data?.payslips || [];
};

export const getPaySlipById = async (id) => {
  const response = await api.get(`/payroll/payslips/${id}`);
  return response.data?.data?.payslip || response.data;
};

/**
 * 9. Salary Structures & Rules
 */
export const getSalaryStructures = async () => {
  const response = await api.get("/salary-rules/structures");
  return response.data?.data?.structures || [];
};

export const createSalaryStructure = async (data) => {
  const response = await api.post("/salary-rules/structures", data);
  return response.data?.data?.structure || response.data;
};

export const getSalaryRules = async (params) => {
  const response = await api.get("/salary-rules/rules", { params });
  return response.data?.data?.rules || [];
};

export const createSalaryRule = async (data) => {
  const response = await api.post("/salary-rules/rules", data);
  return response.data?.data?.rule || response.data;
};

/**
 * 10. Users & Roles Management
 */
export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data?.data?.users || [];
};

export const getRoles = async () => {
  const response = await api.get("/users/roles");
  return response.data?.data?.roles || [];
};

export const createUser = async (data) => {
  const response = await api.post("/users", data);
  return response.data?.data?.user || response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data?.data?.user || response.data;
};

/**
 * 11. Audit Logs & Reports
 */
export const getAuditLogs = async () => {
  const response = await api.get("/audit-logs");
  return response.data?.data?.logs || [];
};

export const getPayrollReports = async () => {
  const response = await api.get("/analytics/payroll");
  return response.data?.data || response.data;
};
