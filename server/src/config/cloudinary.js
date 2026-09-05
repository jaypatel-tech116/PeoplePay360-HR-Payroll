const { v2: cloudinary } = require("cloudinary");
const streamifier = require("stream");
const dotenv = require("dotenv");

dotenv.config();

// Configure Cloudinary SDK with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a memory buffer stream to Cloudinary
 * Avatars never touch local disk.
 * @param {Buffer} buffer - File buffer from Multer memory storage
 * @param {string} folder - Destination folder in Cloudinary
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
const uploadToCloudinary = (buffer, folder = "avatars") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    // Pipe buffer into the Cloudinary upload stream
    uploadStream.end(buffer);
  });
};

/**
 * Delete an existing image from Cloudinary by its public_id
 * @param {string} publicId - Cloudinary asset public_id
 * @returns {Promise<any>}
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("⚠️ Failed to delete image from Cloudinary:", error.message);
    // Don't crash request if asset cleanup fails
    return null;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
};
