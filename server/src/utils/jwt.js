const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT token
 * @param {object} payload - Data to embed in the token (e.g. { id, role })
 * @returns {string} - Signed JWT string
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Verify and decode a JWT token
 * @param {string} token - Signed JWT string
 * @returns {object} - Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Cookie configuration options for JWT session cookie
 */
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true, // Prevents client-side JS from accessing the cookie
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? "none" : "lax", // 'none' allows cross-origin cookies in production HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: "/",
  };
};

/**
 * Attach JWT cookie to HTTP response
 * @param {import("express").Response} res
 * @param {string} token
 */
const setTokenCookie = (res, token) => {
  res.cookie("token", token, getCookieOptions());
};

/**
 * Clear JWT cookie on logout
 * @param {import("express").Response} res
 */
const clearTokenCookie = (res) => {
  const options = getCookieOptions();
  delete options.maxAge;
  res.clearCookie("token", options);
};

module.exports = {
  generateToken,
  verifyToken,
  setTokenCookie,
  clearTokenCookie,
};
