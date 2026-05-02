'use strict';

const db = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * authController — Mengelola login, logout, dan cek sesi
 */
const authController = {
  // POST /api/auth/login
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
      }

      // Cari user berdasarkan username
      // Menggunakan query PostgreSQL ($1) sesuai db.js yang pakai 'pg'
      const userResult = await db.query(
        'SELECT id_user, nama_lengkap, username, email, password_hash, role, is_active FROM users WHERE username = $1 LIMIT 1',
        [username]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Username atau password salah.' });
      }

      const user = userResult.rows[0];

      // Cek apakah user aktif
      if (!user.is_active) {
        return res.status(403).json({ success: false, message: 'Akun Anda telah dinonaktifkan.' });
      }

      // Bandingkan password
      // Karena bcryptjs.compare menerima password plain dan hash
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Username atau password salah.' });
      }

      // Generate session token (32 byte hex)
      const token = crypto.randomBytes(32).toString('hex');
      const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Sesi berlaku 24 jam

      // Simpan ke tabel auth_sessions
      await db.query(
        'INSERT INTO auth_sessions (id_session, id_user, ip_address, user_agent, expired_at) VALUES ($1, $2, $3, $4, $5)',
        [token, user.id_user, req.ip, req.get('user-agent'), expiredAt]
      );

      // Update last_login
      await db.query('UPDATE users SET last_login = NOW() WHERE id_user = $1', [user.id_user]);

      // Kirim response (jangan sertakan password_hash)
      delete user.password_hash;
      res.status(200).json({
        success: true,
        message: 'Login berhasil.',
        data: {
          token,
          user
        }
      });
    } catch (error) {
      console.error('[authController.login]', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
  },

  // POST /api/auth/logout
  logout: async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

      if (token) {
        await db.query('DELETE FROM auth_sessions WHERE id_session = $1', [token]);
      }

      res.status(200).json({ success: true, message: 'Logout berhasil.' });
    } catch (error) {
      console.error('[authController.logout]', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
  },

  // GET /api/auth/me
  me: async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

      if (!token) {
        return res.status(401).json({ success: false, message: 'Token tidak ditemukan.' });
      }

      const sessionResult = await db.query(
        `SELECT u.id_user, u.nama_lengkap, u.username, u.email, u.role 
         FROM auth_sessions s 
         JOIN users u ON s.id_user = u.id_user 
         WHERE s.id_session = $1 AND s.expired_at > NOW()`,
        [token]
      );

      if (sessionResult.rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Sesi tidak valid atau telah berakhir.' });
      }

      res.status(200).json({
        success: true,
        data: sessionResult.rows[0]
      });
    } catch (error) {
      console.error('[authController.me]', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
  },

  // POST /api/auth/register
  register: async (req, res) => {
    try {
      const { nama_lengkap, email, password, username, role } = req.body;

      if (!nama_lengkap || !email || !password) {
        return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi.' });
      }

      // Cek apakah email sudah terdaftar
      const checkEmail = await db.query('SELECT id_user FROM users WHERE email = $1', [email]);
      if (checkEmail.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Email sudah terdaftar.' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      // Simpan user baru
      // Gunakan username default dari email jika tidak diisi
      const finalUsername = username || email.split('@')[0];
      
      const newUser = await db.query(
        `INSERT INTO users (nama_lengkap, email, password_hash, username, role) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id_user, nama_lengkap, email, username, role`,
        [nama_lengkap, email, passwordHash, finalUsername, role || 'staff']
      );

      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil.',
        data: newUser.rows[0]
      });
    } catch (error) {
      console.error('[authController.register]', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
  }
};

module.exports = authController;
