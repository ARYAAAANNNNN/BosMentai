// ================================================================
// src/routes/menuRoutes.js
// ================================================================
'use strict';

const express        = require('express');
const multer         = require('multer');
const upload         = require('../middlewares/upload');
const menuController = require('../controllers/menuController');

const router = express.Router();

// Helper wrapper Multer error untuk respons JSON konsisten
const handleUpload = (req, res, next) => {
  upload.single('gambar')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const msg =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Ukuran file melebihi batas 2MB. Gunakan file lebih kecil.'
          : err.message || 'Format file tidak diizinkan. Hanya PNG, JPG, JPEG.';
      return res.status(400).json({ success: false, message: msg });
    }
    if (err) {
      console.error('[menuRoutes upload]', err);
      return res.status(500).json({ success: false, message: 'Gagal proses file.' });
    }
    next();
  });
};

// GET  /api/menus              → RestaurantMenu.jsx, OrderContext.jsx
router.get('/',              menuController.getAllMenus);

// GET  /api/menus/:id          → detail satu menu
router.get('/:id',           menuController.getMenuById);

// POST /api/menus              → tambah menu baru + upload gambar
router.post('/', handleUpload, menuController.createMenu);

// PUT  /api/menus/:id          → edit menu (bisa sekalian ganti gambar)
router.put('/:id', handleUpload, menuController.updateMenu);

// DELETE /api/menus/:id        → soft-delete menu
router.delete('/:id',        menuController.deleteMenu);

module.exports = router;