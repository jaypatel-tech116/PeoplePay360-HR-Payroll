const employeeService = require("../services/employee.service");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * Get list of employees
 */
const getEmployees = async (req, res, next) => {
  try {
    const { search, department_id, status, employment_type } = req.query;
    const employees = await employeeService.listEmployees({
      search,
      department_id,
      status,
      employment_type,
    });

    return successResponse(res, {
      statusCode: 200,
      message: "Employees retrieved successfully.",
      data: {
        employees,
        total: employees.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get employee details by ID or code
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await employeeService.getEmployeeById(id);

    if (!employee) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Employee not found.",
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Employee details retrieved successfully.",
      data: { employee },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new employee
 */
const createEmployee = async (req, res, next) => {
  try {
    const { employee_code, first_name, last_name, email } = req.body;
    if (!employee_code || !first_name || !last_name || !email) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Employee code, first name, last name, and email are required.",
      });
    }

    const created = await employeeService.createEmployee(req.body);
    return successResponse(res, {
      statusCode: 201,
      message: "Employee created successfully.",
      data: { employee: created },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update employee details
 */
const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await employeeService.updateEmployee(id, req.body);
    return successResponse(res, {
      statusCode: 200,
      message: "Employee updated successfully.",
      data: { employee: updated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Safe delete / deactivate employee record (Phase 4 Admin)
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { pool } = require("../config/mysqlDb");
    await pool.query("UPDATE employees SET status = 'INACTIVE' WHERE id = ?", [id]);
    return successResponse(res, {
      statusCode: 200,
      message: "Employee safely archived/deactivated.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};

