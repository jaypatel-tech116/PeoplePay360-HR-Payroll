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
 * Update profile details
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
 * List all system users (Admin & HR)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.listUsers();
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
 * List all available roles
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
 * Update user role or status (Admin)
 */
const updateUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role_id, is_active, full_name } = req.body;
    const updated = await userService.updateUser(id, {
      roleId: role_id,
      isActive: is_active,
      fullName: full_name,
    });

    return successResponse(res, {
      statusCode: 200,
      message: "User updated successfully.",
      data: { user: updated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new user account (Admin only)
 */
const createUser = async (req, res, next) => {
  try {
    const { email, password, full_name, role } = req.body;
    if (!email) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Email is required.",
      });
    }

    const bcrypt = require("bcryptjs");
    const exists = await userService.checkEmailExists(email);
    if (exists) {
      return errorResponse(res, {
        statusCode: 409,
        message: "A user with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password || "123456", 10);
    const newUser = await userService.createUser({
      email,
      passwordHash,
      fullName: full_name,
      roleCode: role || "EMPLOYEE",
    });

    return successResponse(res, {
      statusCode: 201,
      message: "User account created successfully.",
      data: { user: newUser },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  getAllRoles,
  updateUserById,
  createUser,
};

