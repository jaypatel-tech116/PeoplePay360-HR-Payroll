/**
 * Centralized API client for PeoplePay360
 */

function getHeaders(isFormData = false) {
  const token = localStorage.getItem('peoplepay360_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(options.body instanceof FormData),
      ...options.headers
    }
  });

  if (!res.ok) {
    let errorMsg = 'An unexpected error occurred';
    try {
      const json = await res.json();
      errorMsg = json.error || json.message || errorMsg;
      if (json.blockingWarnings) {
        const err = new Error(errorMsg);
        err.blockingWarnings = json.blockingWarnings;
        err.canForce = json.canForce;
        throw err;
      }
    } catch (e) {
      if (e.blockingWarnings) throw e;
    }
    throw new Error(errorMsg);
  }

  // If content is PDF or binary, return blob
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/pdf')) {
    return res.blob();
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/api/auth/me'),
  uploadAvatar: (formData) => request('/api/auth/avatar', { method: 'POST', body: formData }),

  // Employees
  getEmployees: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/employees${q ? '?' + q : ''}`);
  },
  getEmployeeById: (id) => request(`/api/employees/${id}`),
  getEmployeeCounts: (id) => request(`/api/employees/${id}/counts`),
  getEmployeeContracts: (id) => request(`/api/employees/${id}/contracts`),
  getEmployeeAttendance: (id) => request(`/api/employees/${id}/attendance`),
  getEmployeeTimeOff: (id) => request(`/api/employees/${id}/time-off`),
  createEmployee: (data) => request('/api/employees', { method: 'POST', body: JSON.stringify(data) }),
  updateEmployee: (id, data) => request(`/api/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Contracts
  getContracts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/contracts${q ? '?' + q : ''}`);
  },
  getContractById: (id) => request(`/api/contracts/${id}`),
  createContract: (data) => request('/api/contracts', { method: 'POST', body: JSON.stringify(data) }),
  updateContract: (id, data) => request(`/api/contracts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteContract: (id) => request(`/api/contracts/${id}`, { method: 'DELETE' }),

  // Working Schedules
  getSchedules: () => request('/api/working-schedules'),
  getScheduleById: (id) => request(`/api/working-schedules/${id}`),
  createSchedule: (data) => request('/api/working-schedules', { method: 'POST', body: JSON.stringify(data) }),
  updateSchedule: (id, data) => request(`/api/working-schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Time Off
  getTimeOffTypes: () => request('/api/time-off/types'),
  createTimeOffType: (data) => request('/api/time-off/types', { method: 'POST', body: JSON.stringify(data) }),
  getTimeOffAllocations: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/time-off/allocations${q ? '?' + q : ''}`);
  },
  createTimeOffAllocation: (data) => request('/api/time-off/allocations', { method: 'POST', body: JSON.stringify(data) }),
  getTimeOffRequests: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/time-off/requests${q ? '?' + q : ''}`);
  },
  createTimeOffRequest: (data) => request('/api/time-off/requests', { method: 'POST', body: JSON.stringify(data) }),
  approveTimeOffRequest: (id) => request(`/api/time-off/requests/${id}/approve`, { method: 'POST' }),
  refuseTimeOffRequest: (id) => request(`/api/time-off/requests/${id}/refuse`, { method: 'POST' }),

  // Attendance
  getAttendances: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/attendance${q ? '?' + q : ''}`);
  },
  getTodayAttendance: () => request('/api/attendance/today'),
  checkIn: (employee_id) => request('/api/attendance/check-in', { method: 'POST', body: JSON.stringify({ employee_id }) }),
  checkOut: (employee_id) => request('/api/attendance/check-out', { method: 'POST', body: JSON.stringify({ employee_id }) }),
  correctAttendance: (id, data) => request(`/api/attendance/${id}/correct`, { method: 'POST', body: JSON.stringify(data) }),

  // Salary Structures & Rules
  getSalaryStructures: () => request('/api/salary-structures'),
  getSalaryStructureById: (id) => request(`/api/salary-structures/${id}`),
  createSalaryStructure: (data) => request('/api/salary-structures', { method: 'POST', body: JSON.stringify(data) }),
  updateSalaryStructure: (id, data) => request(`/api/salary-structures/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSalaryStructure: (id) => request(`/api/salary-structures/${id}`, { method: 'DELETE' }),

  getRulesByStructure: (structureId) => request(`/api/salary-structures/${structureId}/rules`),
  createSalaryRule: (structureId, data) => request(`/api/salary-structures/${structureId}/rules`, { method: 'POST', body: JSON.stringify(data) }),
  updateSalaryRule: (id, data) => request(`/api/salary-rules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSalaryRule: (id) => request(`/api/salary-rules/${id}`, { method: 'DELETE' }),

  // Payruns (Two-Step Wizard + Batch processing)
  previewEligibleEmployees: (data) => request('/api/payruns/preview-eligible-employees', { method: 'POST', body: JSON.stringify(data) }),
  createPayrun: (data) => request('/api/payruns', { method: 'POST', body: JSON.stringify(data) }),
  getPayruns: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/payruns${q ? '?' + q : ''}`);
  },
  getPayrunById: (id) => request(`/api/payruns/${id}`),
  computePayrun: (id) => request(`/api/payruns/${id}/compute`, { method: 'POST' }),
  validatePayrun: (id, force = false) => request(`/api/payruns/${id}/validate`, { method: 'POST', body: JSON.stringify({ force }) }),
  markPaidPayrun: (id) => request(`/api/payruns/${id}/mark-paid`, { method: 'POST' }),
  sendPayrunPayslips: (id) => request(`/api/payruns/${id}/send-payslips`, { method: 'POST' }),
  deletePayrun: (id) => request(`/api/payruns/${id}`, { method: 'DELETE' }),

  // Payslips
  getPayslips: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/payslips${q ? '?' + q : ''}`);
  },
  getPayslipById: (id) => request(`/api/payslips/${id}`),
  downloadPayslipPDF: async (id, filename = `Payslip_${id}.pdf`) => {
    const blob = await request(`/api/payslips/${id}/pdf`);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Dashboard
  getDashboard: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/dashboard${q ? '?' + q : ''}`);
  },

  // Metadata
  getDepartments: () => request('/api/departments'),
  getJobPositions: (deptId) => request(`/api/job-positions${deptId ? '?department_id=' + deptId : ''}`),

  // Users & Admin
  getUsers: () => request('/api/users'),
  getRoles: () => request('/api/users/roles'),
  updateUserRole: (id, role_id) => request(`/api/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role_id }) }),
  toggleUserStatus: (id, is_active) => request(`/api/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ is_active }) })
};
