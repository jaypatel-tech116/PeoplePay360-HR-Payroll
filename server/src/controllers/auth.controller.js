const authService = require("../services/auth.service");
const userService = require("../services/user.service");
const { setTokenCookie, clearTokenCookie } = require("../utils/jwt");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * Handle user registration with optional avatar
 * Automatically logs in the user by attaching a JWT cookie
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const avatarFile = req.file;

    const { user, token } = await authService.registerUser({
      name,
      email,
      password,
      avatarFile,
    });

    // Set secure httpOnly cookie
    setTokenCookie(res, token);

    return successResponse(res, {
      statusCode: 201,
      message: "Registration successful. You are now logged in.",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user login
 * Verifies credentials and sets JWT session cookie
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await authService.loginUser({
      email,
      password,
    });

    // Set secure httpOnly cookie
    setTokenCookie(res, token);

    return successResponse(res, {
      statusCode: 200,
      message: "Login successful.",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user logout
 * Clears authentication cookie
 */
const logout = (req, res) => {
  clearTokenCookie(res);
  return successResponse(res, {
    statusCode: 200,
    message: "Logged out successfully.",
  });
};

/**
 * Get currently authenticated user data
 * Used by frontend to rehydrate session on page refresh
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await userService.findUserById(req.user.id);

    if (!user) {
      return errorResponse(res, {
        statusCode: 404,
        message: "User profile not found.",
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Current user profile fetched successfully.",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
};
