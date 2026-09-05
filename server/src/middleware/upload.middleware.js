const multer = require("multer");

// Use memory storage so file buffers stay in RAM and never touch local disk
const storage = multer.memoryStorage();

// Allowed MIME types for user avatars
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

/**
 * Filter function to reject non-image file uploads
 */
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error("Invalid file type. Only JPG, PNG, and WebP images are allowed.");
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

// Single avatar file upload middleware
const uploadAvatar = upload.single("avatar");

module.exports = {
  uploadAvatar,
  MAX_FILE_SIZE,
};
