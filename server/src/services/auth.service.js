const bcrypt = require("bcryptjs");
const userService = require("./user.service");
const { generateToken } = require("../utils/jwt");

/**
 * Register a new user with email and password
 * @param {object} params
 * @param {string} params.email
 * @param {string} params.password
 * @param {string} [params.fullName]
 * @param {string} [params.roleCode]
 * @returns {Promise<{ user: object, token: string }>}
 */
const registerUser = async ({ email, password, fullName, roleCode = "EMPLOYEE" }) => {
  // 1. Check if email is already registered
  const exists = await userService.checkEmailExists(email);
  if (exists) {
    const error = new Error("An account with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  // 2. Hash password with bcrypt
  const passwordHash = await bcrypt.hash(password, 10);

  // 3. Create user in MySQL database
  const newUser = await userService.createUser({
    email,
    passwordHash,
    fullName,
    roleCode,
  });

  // 4. Generate JWT session token
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
  // 1. Retrieve user by email (contains password_hash from MySQL users table)
  const user = await userService.findUserByEmail(email);
  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  // 2. Verify bcrypt password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  // 3. Update last login timestamp asynchronously
  await userService.updateLastLogin(user.id);

  // 4. Generate JWT session token
  const token = generateToken({ id: user.id, role: user.role });

  // 5. Remove password_hash before returning
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
