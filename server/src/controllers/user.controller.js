const bcrypt = require("bcryptjs");
const userService = require("../services/user.service");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * Get profile for logged-in user
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await userService.findUserById(req.user.id);

    if (!user) {
      return errorResponse(res, {
        statusCode: 404,
        message: "User not found.",
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Profile retrieved successfully.",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update profile details (Self)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { full_name } = req.body;
    const updatedUser = await userService.updateUser(req.user.id, { fullName: full_name });

    return successResponse(res, {
      statusCode: 200,
      message: "Profile updated successfully.",
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all system stakeholders & users (Admin & HR)
 * Supports ?role=...&status=...&search=...
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const users = await userService.listUsers({ role, status, search });
    return successResponse(res, {
      statusCode: 200,
      message: "Users retrieved successfully.",
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single user / stakeholder details by ID
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.findUserById(id);
    if (!user) {
      return errorResponse(res, {
        statusCode: 404,
        message: "User account not found.",
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: "User retrieved successfully.",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all available roles with user counts
 */
const getAllRoles = async (req, res, next) => {
  try {
    const roles = await userService.listRoles();
    return successResponse(res, {
      statusCode: 200,
      message: "Roles retrieved successfully.",
      data: { roles },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new user / stakeholder account (Admin only)
 * Supports all stakeholder roles: HR_MANAGER, EMPLOYEE, HR_PAYROLL_MANAGER, HR_PAYROLL_USER, ADMIN
 */
const createUser = async (req, res, next) => {
  try {
    const { email, password, full_name, role, department_id, designation, phone } = req.body;
    if (!email) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Email address is required.",
      });
    }

    const exists = await userService.checkEmailExists(email);
    if (exists) {
      return errorResponse(res, {
        statusCode: 409,
        message: "A user account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password || "123456", 10);
    const newUser = await userService.createUser({
      email,
      passwordHash,
      fullName: full_name,
      roleCode: role || "EMPLOYEE",
      departmentId: department_id ? Number(department_id) : null,
      designation: designation ? designation.trim() : null,
      phone: phone ? phone.trim() : null,
    });

    return successResponse(res, {
      statusCode: 201,
      message: "Stakeholder account created successfully.",
      data: { user: newUser },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user / stakeholder account (Admin only)
 * Can update full name, email, role, department, designation, status, and reset password
 */
const updateUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      role_id,
      role,
      is_active,
      full_name,
      email,
      department_id,
      designation,
      phone,
      password,
    } = req.body;

    // If email is changing, ensure it's not taken by another user
    if (email) {
      const emailExists = await userService.checkEmailExists(email, id);
      if (emailExists) {
        return errorResponse(res, {
          statusCode: 409,
          message: "Email address is already in use by another user.",
        });
      }
    }

    let passwordHash = null;
    if (password && password.trim()) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await userService.updateUser(id, {
      roleId: role_id ? Number(role_id) : undefined,
      roleCode: role,
      isActive: is_active !== undefined ? Boolean(is_active) : undefined,
      fullName: full_name,
      email,
      departmentId: department_id !== undefined ? (department_id ? Number(department_id) : null) : undefined,
      designation,
      phone,
      passwordHash,
    });

    return successResponse(res, {
      statusCode: 200,
      message: "Stakeholder account updated successfully.",
      data: { user: updated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Soft delete / deactivate user account (Admin only)
 * Does NOT delete database rows; sets is_active = 0 and status = 'INACTIVE'
 */
const deactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent admin from deactivating their own currently logged in account
    if (req.user && req.user.id === id) {
      return errorResponse(res, {
        statusCode: 400,
        message: "You cannot deactivate your own administrative account.",
      });
    }

    const updated = await userService.deactivateUser(id);
    return successResponse(res, {
      statusCode: 200,
      message: "Account deactivated successfully (soft delete). Historic records and payroll batches are fully preserved.",
      data: { user: updated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reactivate user account (Admin only)
 * Sets is_active = 1 and status = 'ACTIVE'
 */
const activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await userService.activateUser(id);
    return successResponse(res, {
      statusCode: 200,
      message: "Account reactivated successfully.",
      data: { user: updated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get live stakeholder summary stats (Admin & HR)
 */
const getStakeholderStats = async (req, res, next) => {
  try {
    const stats = await userService.getStakeholderStats();
    return successResponse(res, {
      statusCode: 200,
      message: "Stakeholder statistics retrieved successfully.",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  getAllRoles,
  createUser,
  updateUserById,
  deactivateUser,
  activateUser,
  getStakeholderStats,
};
