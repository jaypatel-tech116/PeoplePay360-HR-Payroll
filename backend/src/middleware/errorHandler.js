/**
 * Global Error Handler Middleware
 * Catches all unhandled errors and returns a consistent JSON response.
 * Should be registered LAST in the middleware chain.
 */

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err.message);

  // Don't leak stack traces in production
  const isDev = process.env.NODE_ENV !== 'production';

  res.status(err.status || 500).json({
    error: err.message || 'An unexpected internal error occurred.',
    ...(isDev && { stack: err.stack })
  });
};

module.exports = errorHandler;
module.exports.errorHandler = errorHandler;
