const { query } = require("../config/db");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");

/**
 * Find user by ID (excludes password_hash for safety)
 * @param {string|number} id
 * @returns {Promise<object|null>}
 */
const findUserById = async (id) => {
  const sql = `
    SELECT id, name, email, avatar_url, avatar_public_id, role, created_at, updated_at
    FROM users
    WHERE id = $1
    LIMIT 1;
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

/**
 * Find user by email (includes password_hash for credential validation)
 * @param {string} email
 * @returns {Promise<object|null>}
 */
const findUserByEmail = async (email) => {
  const sql = `
    SELECT id, name, email, password_hash, avatar_url, avatar_public_id, role, created_at, updated_at
    FROM users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1;
  `;
  const result = await query(sql, [email]);
  return result.rows[0] || null;
};

/**
 * Check if an email is already taken by another user
 * @param {string} email
 * @param {string|number} excludeUserId
 * @returns {Promise<object|null>}
 */
const findUserByEmailExceptId = async (email, excludeUserId) => {
  const sql = `
    SELECT id, email
    FROM users
    WHERE LOWER(email) = LOWER($1) AND id != $2
    LIMIT 1;
  `;
  const result = await query(sql, [email, excludeUserId]);
  return result.rows[0] || null;
};

/**
 * Insert a new user into the database
 * Uses RETURNING clause for atomic insert-and-read
 * @param {object} userData
 * @returns {Promise<object>}
 */
const createUser = async ({ name, email, passwordHash, avatarUrl = null, avatarPublicId = null, role = "user" }) => {
  const sql = `
    INSERT INTO users (name, email, password_hash, avatar_url, avatar_public_id, role)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, name, email, avatar_url, avatar_public_id, role, created_at, updated_at;
  `;
  const params = [name, email.toLowerCase(), passwordHash, avatarUrl, avatarPublicId, role];
  const result = await query(sql, params);
  return result.rows[0];
};

/**
 * Update user profile (name, email, and optionally upload/replace avatar in Cloudinary)
 * @param {object} params
 * @param {string|number} params.userId
 * @param {string} params.name
 * @param {string} params.email
 * @param {Express.Multer.File} [params.avatarFile]
 * @returns {Promise<object>}
 */
const updateUserProfile = async ({ userId, name, email, avatarFile }) => {
  // 1. Fetch current user from database
  const currentUser = await findUserById(userId);
  if (!currentUser) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  // 2. Check if new email conflicts with another user
  if (email && email.toLowerCase() !== currentUser.email.toLowerCase()) {
    const emailConflict = await findUserByEmailExceptId(email, userId);
    if (emailConflict) {
      const error = new Error("This email is already in use by another account.");
      error.statusCode = 409;
      throw error;
    }
  }

  let updatedAvatarUrl = currentUser.avatar_url;
  let updatedAvatarPublicId = currentUser.avatar_public_id;
  const oldPublicId = currentUser.avatar_public_id;

  // 3. Handle avatar upload to Cloudinary if a new file is provided
  if (avatarFile && avatarFile.buffer) {
    // Upload new image buffer directly to Cloudinary (memory storage - no local disk)
    const cloudinaryResult = await uploadToCloudinary(avatarFile.buffer, "avatars");
    updatedAvatarUrl = cloudinaryResult.secure_url;
    updatedAvatarPublicId = cloudinaryResult.public_id;

    // Delete old avatar from Cloudinary if it previously had one
    if (oldPublicId) {
      await deleteFromCloudinary(oldPublicId);
    }
  }

  // 4. Update user record in PostgreSQL with RETURNING clause
  const sql = `
    UPDATE users
    SET name = COALESCE($1, name),
        email = COALESCE(LOWER($2), email),
        avatar_url = $3,
        avatar_public_id = $4,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING id, name, email, avatar_url, avatar_public_id, role, created_at, updated_at;
  `;
  const params = [
    name || currentUser.name,
    email ? email.toLowerCase() : currentUser.email,
    updatedAvatarUrl,
    updatedAvatarPublicId,
    userId,
  ];

  const result = await query(sql, params);
  return result.rows[0];
};

module.exports = {
  findUserById,
  findUserByEmail,
  findUserByEmailExceptId,
  createUser,
  updateUserProfile,
};
