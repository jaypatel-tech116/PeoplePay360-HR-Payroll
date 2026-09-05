const multer = require("multer");
const { errorResponse } = require("../utils/apiResponse");

/**
 * Centralized application error handler
 * Catches unhandled errors, database violations, and file upload limits
 */
const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";

  // Log error details for server diagnostics
  if (!isProduction) {
    console.error("💥 Error caught in centralized errorHandler:", err);
  } else {
    console.error(`💥 Error: ${err.message}`);
  }

  // 1. PostgreSQL unique constraint violation (error code 23505)
  if (err.code === "23505") {
    return errorResponse(res, {
      statusCode: 409,
      message: "An account with this email address already exists.",
    });
  }

  // 2. Multer file size error
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return errorResponse(res, {
        statusCode: 400,
        message: "File size exceeds the 2MB limit. Please upload a smaller image.",
      });
    }
    return errorResponse(res, {
      statusCode: 400,
      message: `File upload error: ${err.message}`,
    });
  }

  // 3. Known application errors with explicit status code
  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected internal server error occurred.";

  return errorResponse(res, {
    statusCode,
    message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = {
  errorHandler,
};
