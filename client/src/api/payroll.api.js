import api from "./axios";

/**
 * PeoplePay360 Payroll Manager Unified API Client
 * Connects all Payroll Management UI views directly to backend database endpoints.
 */

export const payrollApi = {
  // 1. Dashboard & Analytics
  getDashboard: () => api.get("/analytics/dashboard").then((res) => res.data.data),
  getReports: (reportType = "department", params = {}) =>
    api.get("/analytics/reports", { params: { report_type: reportType, ...params } }).then((res) => res.data.data),

  // 2. Payruns Lifecycle
  getPayruns: () =>
    api.get("/payroll/payruns").then((res) => res.data.data?.payruns || (Array.isArray(res.data.data) ? res.data.data : [])),
  getPayrunById: (id) =>
    api.get(`/payroll/payruns/${id}`).then((res) => res.data.data?.payrun || res.data.data),
  createPayrun: (data) =>
    api.post("/payroll/payruns", data).then((res) => res.data.data?.payrun || res.data.data),
  computePayrun: (id, employeeIds = null) =>
    api.post(`/payroll/payruns/${id}/compute`, { employee_ids: employeeIds }).then((res) => res.data.data?.payrun || res.data.data),
  validatePayrun: (id) =>
    api.post(`/payroll/payruns/${id}/validate`).then((res) => res.data.data),
  markPayrunPaid: (id) =>
    api.post(`/payroll/payruns/${id}/mark-paid`).then((res) => res.data.data?.payrun || res.data.data),
  sendPayslips: (id) =>
    api.post(`/payroll/payruns/${id}/send-payslips`).then((res) => res.data.data),
  deletePayrun: (id) =>
    api.delete(`/payroll/payruns/${id}`).then((res) => res.data.data),

  // 3. Payslips
  getPayslips: (params = {}) =>
    api.get("/payroll/payslips", { params }).then((res) => res.data.data?.payslips || (Array.isArray(res.data.data) ? res.data.data : [])),
  getPayslipById: (id) =>
    api.get(`/payroll/payslips/${id}`).then((res) => res.data.data?.payslip || res.data.data),
  getPayslipPdfUrl: (slipId) => `${api.defaults.baseURL}/payroll/payslips/${slipId}/pdf`,

  // 4. HR Master Data (Live Database Access)
  getEmployees: (params = {}) =>
    api.get("/employees", { params }).then((res) => res.data.data?.employees || (Array.isArray(res.data.data) ? res.data.data : [])),
  getContracts: (params = {}) =>
    api.get("/contracts", { params }).then((res) => res.data.data?.contracts || (Array.isArray(res.data.data) ? res.data.data : [])),
  getAttendance: (params = {}) =>
    api.get("/attendance", { params }).then((res) => res.data.data?.attendance || (Array.isArray(res.data.data) ? res.data.data : [])),
  getTimeOff: (params = {}) =>
    api.get("/leaves/requests", { params }).then((res) => res.data.data?.requests || (Array.isArray(res.data.data) ? res.data.data : [])),

  // 5. Configuration (Salary Structures & Rules)
  getSalaryStructures: () =>
    api.get("/salary-rules/structures").then((res) => res.data.data?.structures || (Array.isArray(res.data.data) ? res.data.data : [])),
  createSalaryStructure: (data) => api.post("/salary-rules/structures", data).then((res) => res.data.data),
  updateSalaryStructure: (id, data) => api.put(`/salary-rules/structures/${id}`, data).then((res) => res.data.data),
  deleteSalaryStructure: (id) => api.delete(`/salary-rules/structures/${id}`).then((res) => res.data.data),

  getSalaryRules: (structureId = null) =>
    api
      .get("/salary-rules/rules", { params: structureId ? { salary_structure_id: structureId } : {} })
      .then((res) => res.data.data?.rules || (Array.isArray(res.data.data) ? res.data.data : [])),
  createSalaryRule: (data) => api.post("/salary-rules/rules", data).then((res) => res.data.data),
  updateSalaryRule: (id, data) => api.put(`/salary-rules/rules/${id}`, data).then((res) => res.data.data),
  deleteSalaryRule: (id) => api.delete(`/salary-rules/rules/${id}`).then((res) => res.data.data),
  validateFormula: (formula, sampleWage = 50000) =>
    api.post("/salary-rules/rules/validate-formula", { formula, sampleWage }).then((res) => res.data),
};

export default payrollApi;
