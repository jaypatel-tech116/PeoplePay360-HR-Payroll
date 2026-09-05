const express = require("express");
const router = express.Router();
const hrController = require("../controllers/hr.controller");
const { requireHrManager } = require("../middleware/hrAuth.middleware");

// Enforce HR_MANAGER authentication & role check on all /api/hr/* routes
router.use(requireHrManager);

// ----------------------------------------------------------------------------
// 1. Dashboard Statistics
// ----------------------------------------------------------------------------
router.get("/dashboard/employees", hrController.getEmployeeDashboardStats);

// ----------------------------------------------------------------------------
// 2. Employees & Onboarding
// ----------------------------------------------------------------------------
router.get("/employees", hrController.getEmployees);
router.post("/employees", hrController.createEmployee);
router.get("/employees/pipeline", hrController.getEmployeePipeline);
router.get("/employees/:id", hrController.getEmployeeById);
router.patch("/employees/:id", hrController.updateEmployee);
router.patch("/employees/:id/status", hrController.updateEmployeeStatus);
router.patch("/employees/:id/pipeline-stage", hrController.updateEmployeePipelineStage);
router.get("/employees/:id/contracts", hrController.getEmployeeContracts);
router.get("/employees/:id/leave-balance", hrController.getEmployeeLeaveBalance);

// ----------------------------------------------------------------------------
// 3. Departments Module
// ----------------------------------------------------------------------------
router.get("/departments", hrController.getDepartments);
router.post("/departments", hrController.createDepartment);
router.patch("/departments/:id", hrController.updateDepartment);
router.delete("/departments/:id", hrController.deleteDepartment);

// ----------------------------------------------------------------------------
// 4. Working Schedules Module
// ----------------------------------------------------------------------------
router.get("/schedules", hrController.getSchedules);
router.get("/schedules/:id", hrController.getScheduleById);
router.post("/schedules", hrController.createSchedule);
router.patch("/schedules/:id", hrController.updateSchedule);
router.delete("/schedules/:id", hrController.deleteSchedule);

// ----------------------------------------------------------------------------
// 5. Employee Contracts Module
// ----------------------------------------------------------------------------
router.get("/contracts", hrController.getContracts);
router.get("/contracts/:id", hrController.getContractById);
router.post("/contracts", hrController.createContract);
router.patch("/contracts/:id", hrController.updateContract);
router.patch("/contracts/:id/status", hrController.updateContractStatus);

// ----------------------------------------------------------------------------
// 6. Attendance Module
// ----------------------------------------------------------------------------
router.get("/attendance", hrController.getAttendance);
router.get("/attendance/summary", hrController.getAttendanceSummary);
router.post("/attendance", hrController.createAttendance);
router.patch("/attendance/:id", hrController.updateAttendance);

// ----------------------------------------------------------------------------
// 7. Leave Types & Allocations Module
// ----------------------------------------------------------------------------
router.get("/leave-types", hrController.getLeaveTypes);
router.post("/leave-types", hrController.createLeaveType);
router.patch("/leave-types/:id", hrController.updateLeaveType);
router.delete("/leave-types/:id", hrController.deleteLeaveType);

router.get("/leave-allocations", hrController.getLeaveAllocations);
router.post("/leave-allocations", hrController.createLeaveAllocation);

// ----------------------------------------------------------------------------
// 8. Leave Requests & Approvals
// ----------------------------------------------------------------------------
router.get("/leave-requests", hrController.getLeaveRequests);
router.get("/leave-requests/:id", hrController.getLeaveRequestById);
router.post("/leave-requests", hrController.createLeaveRequest);
router.post("/leave-requests/:id/approve", hrController.approveLeaveRequest);
router.post("/leave-requests/:id/reject", hrController.rejectLeaveRequest);
router.get("/leaves/summary", hrController.getLeaveSummary);

// ----------------------------------------------------------------------------
// 9. HR Reports
// ----------------------------------------------------------------------------
router.get("/reports/attendance", hrController.getAttendanceReport);
router.get("/reports/leaves", hrController.getLeaveReport);
router.get("/reports/employees", hrController.getEmployeeReport);
router.get("/reports/departments", hrController.getDepartmentReport);

// ----------------------------------------------------------------------------
// 10. CSV Export
// ----------------------------------------------------------------------------
router.get("/export/:module", hrController.exportCsv);

module.exports = router;
