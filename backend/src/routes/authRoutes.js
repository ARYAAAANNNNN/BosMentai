'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * authRoutes — Definisi endpoint untuk autentikasi
 * Prefix: /api/auth
 */

// Route untuk login
router.post('/login', authController.login);

// Route untuk register
router.post('/register', authController.register);

// Route untuk logout
router.post('/logout', authController.logout);

// Route untuk cek sesi aktif dan ambil data profil
router.get('/me', authController.me);

module.exports = router;
