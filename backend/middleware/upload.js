const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Image upload handling.
 *
 * Design decision: images are stored on local disk under backend/uploads
 * and served statically (see server.js) rather than wired up to a cloud
 * bucket. This keeps the project runnable with zero external accounts for
 * local development / portfolio review. Swapping in S3/Cloudinary later
 * only means changing this one file — controllers just read `req.file` and
 * store whatever URL string this layer hands back.
 */
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '')
      .slice(0, 40);
    cb(null, `${Date.now()}-${safeBase || 'recipe'}${ext}`);
  },
});

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WEBP, or GIF images are allowed'));
  }
};

const maxSizeBytes = (Number(process.env.MAX_UPLOAD_MB) || 5) * 1024 * 1024;

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSizeBytes },
});

module.exports = upload;
