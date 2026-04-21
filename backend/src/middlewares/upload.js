// middlewares/upload.js
'use strict';

const multer = require('multer');
const path   = require('path');
const crypto = require('crypto');
const fs     = require('fs');

// Buat folder jika belum ada
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'menus');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req, file, cb) => {
    // Nama file acak 16 byte hex agar tidak bentrok
    const hex = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${hex}${ext}`);
  },
});

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png']);
const ALLOWED_EXTS  = new Set(['.jpg', '.jpeg', '.png']);

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIMES.has(file.mimetype) && ALLOWED_EXTS.has(ext)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Hanya file PNG, JPG, atau JPEG yang diizinkan.'));
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // max 2MB
});