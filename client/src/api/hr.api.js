import api from "./axios";

export const hrApi = {
  // Dashboard KPI
  getDashboardStats: () => api.get("/hr/dashboard/employees").then((res) => res.data.data),

  // Employees & Pipeline
  getEmployees: (params) => api.get("/hr/employees", { params }).then((res) => res.data.data),
  getEmployeePipeline: () => api.get("/hr/employees/pipeline").then((res) => res.data.data),
  getEmployeeById: (id) => api.get(`/hr/employees/${id}`).then((res) => res.data.data),
  createEmployee: (data) => api.post("/hr/employees", data).then((res) => res.data.data),
  updateEmployee: (id, data) => api.patch(`/hr/employees/${id}`, data).then((res) => res.data.data),
  updateEmployeeStatus: (id, status) =>
    api.patch(`/hr/employees/${id}/status`, { status }).then((res) => res.data.data),
  updateEmployeePipelineStage: (id, pipeline_stage) =>
    api.patch(`/hr/employees/${id}/pipeline-stage`, { pipeline_stage }).then((res) => res.data.data),

  // Departments
  getDepartments: () => api.get("/hr/departments").then((res) => res.data.data),
  createDepartment: (data) => api.post("/hr/departments", data).then((res) => res.data.data),

  // Schedules
  getSchedules: () => api.get("/hr/schedules").then((res) => res.data.data),

  // Contracts
  getContracts: () => api.get("/hr/contracts").then((res) => res.data.data),
  createContract: (data) => api.post("/hr/contracts", data).then((res) => res.data.data),

  // Attendance
  getAttendance: (params) => api.get("/hr/attendance", { params }).then((res) => res.data.data),
  getAttendanceSummary: () => api.get("/hr/attendance/summary").then((res) => res.data.data),
  createAttendance: (data) => api.post("/hr/attendance", data).then((res) => res.data.data),
  updateAttendance: (id, data) => api.patch(`/hr/attendance/${id}`, data).then((res) => res.data.data),

  // Leave Module
  getLeaveTypes: () => api.get("/hr/leave-types").then((res) => res.data.data),
  getLeaveAllocations: (params) => api.get("/hr/leave-allocations", { params }).then((res) => res.data.data),
  getLeaveRequests: (params) => api.get("/hr/leave-requests", { params }).then((res) => res.data.data),
  createLeaveRequest: (data) => api.post("/hr/leave-requests", data).then((res) => res.data.data),
  approveLeaveRequest: (id) => api.post(`/hr/leave-requests/${id}/approve`).then((res) => res.data.data),
  rejectLeaveRequest: (id, reason) =>
    api.post(`/hr/leave-requests/${id}/reject`, { reason }).then((res) => res.data.data),
  getLeaveSummary: () => api.get("/hr/leaves/summary").then((res) => res.data.data),

  // Reports
  getAttendanceReport: () => api.get("/hr/reports/attendance").then((res) => res.data.data),
  getLeaveReport: () => api.get("/hr/reports/leaves").then((res) => res.data.data),
  getEmployeeReport: () => api.get("/hr/reports/employees").then((res) => res.data.data),
  getDepartmentReport: () => api.get("/hr/reports/departments").then((res) => res.data.data),

  // Export URL
  getExportUrl: (module) => `${api.defaults.baseURL}/hr/export/${module}`,
};

export default hrApi;
