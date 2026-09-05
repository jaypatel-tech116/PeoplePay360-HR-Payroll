const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'peoplepay360',
  api_key: process.env.CLOUDINARY_API_KEY || '123456789012345',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'abcdefghijklmnopqrstuvwxyz'
});

// Multer in-memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

/**
 * Upload buffer to Cloudinary with safe fallback
 */
const uploadToCloudinary = (fileBuffer, folder = 'peoplepay360_avatars') => {
  return new Promise((resolve, reject) => {
    // Check if real Cloudinary keys are provided
    const isRealCloudinary =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'demo' &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'peoplepay360';

    if (!isRealCloudinary) {
      // In local demo environment without external credentials, convert to safe Data URI
      const base64Data = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
      return resolve(base64Data);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) {
          console.warn('Cloudinary upload failed, falling back to data URI:', error.message);
          return resolve(`data:image/jpeg;base64,${fileBuffer.toString('base64')}`);
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

module.exports = { upload, uploadToCloudinary, cloudinary };
