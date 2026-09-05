/**
 * Send a standardized success JSON response
 * @param {import("express").Response} res
 * @param {object} options
 * @param {number} [options.statusCode=200]
 * @param {string} options.message
 * @param {any} [options.data=null]
 */
const successResponse = (res, { statusCode = 200, message = "Success", data = null }) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send a standardized error JSON response
 * @param {import("express").Response} res
 * @param {object} options
 * @param {number} [options.statusCode=500]
 * @param {string} options.message
 * @param {any} [options.errors=null]
 */
const errorResponse = (res, { statusCode = 500, message = "Internal Server Error", errors = null }) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
