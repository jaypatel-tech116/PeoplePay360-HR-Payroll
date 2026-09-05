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
 * Update profile details (name, email, and/or avatar)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const avatarFile = req.file;

    const updatedUser = await userService.updateUserProfile({
      userId: req.user.id,
      name,
      email,
      avatarFile,
    });

    return successResponse(res, {
      statusCode: 200,
      message: "Profile updated successfully.",
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
