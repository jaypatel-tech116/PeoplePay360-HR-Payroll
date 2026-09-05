const bcrypt = require("bcryptjs");
const userService = require("./user.service");
const { uploadToCloudinary } = require("../config/cloudinary");
const { generateToken } = require("../utils/jwt");

/**
 * Register a new user, optionally uploading avatar to Cloudinary,
 * and generate a JWT token for auto-login
 * @param {object} params
 * @param {string} params.name
 * @param {string} params.email
 * @param {string} params.password
 * @param {Express.Multer.File} [params.avatarFile]
 * @returns {Promise<{ user: object, token: string }>}
 */
const registerUser = async ({ name, email, password, avatarFile }) => {
  // 1. Check if email is already taken
  const existingUser = await userService.findUserByEmail(email);
  if (existingUser) {
    const error = new Error("An account with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  // 2. Upload avatar to Cloudinary if provided during signup
  let avatarUrl = null;
  let avatarPublicId = null;

  if (avatarFile && avatarFile.buffer) {
    const cloudinaryResult = await uploadToCloudinary(avatarFile.buffer, "avatars");
    avatarUrl = cloudinaryResult.secure_url;
    avatarPublicId = cloudinaryResult.public_id;
  }

  // 3. Hash password with bcrypt (12 salt rounds)
  const passwordHash = await bcrypt.hash(password, 12);

  // 4. Insert user record into PostgreSQL
  const newUser = await userService.createUser({
    name,
    email,
    passwordHash,
    avatarUrl,
    avatarPublicId,
    role: "user",
  });

  // 5. Generate JWT token for auto-login
  const token = generateToken({ id: newUser.id, role: newUser.role });

  return {
    user: newUser,
    token,
  };
};

/**
 * Authenticate existing user with email and password
 * @param {object} params
 * @param {string} params.email
 * @param {string} params.password
 * @returns {Promise<{ user: object, token: string }>}
 */
const loginUser = async ({ email, password }) => {
  // 1. Find user by email (retrieves password_hash)
  const user = await userService.findUserByEmail(email);
  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  // 2. Verify password with bcrypt
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  // 3. Generate JWT token
  const token = generateToken({ id: user.id, role: user.role });

  // 4. Strip sensitive password_hash before returning user object
  const { password_hash, ...safeUser } = user;

  return {
    user: safeUser,
    token,
  };
};

module.exports = {
  registerUser,
  loginUser,
};
