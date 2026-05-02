'use strict';

const db = require('../config/db');

/**
 * authMiddleware — Melindungi route yang butuh login
 * Mengecek token di header Authorization: Bearer <token>
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Akses ditolak. Silakan login terlebih dahulu.' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Cek apakah session token ada di database dan belum expired
    const sessionResult = await db.query(
      `SELECT u.id_user, u.nama_lengkap, u.username, u.email, u.role 
       FROM auth_sessions s 
       JOIN users u ON s.id_user = u.id_user 
       WHERE s.id_session = $1 AND s.expired_at > NOW()`,
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Sesi Anda telah berakhir. Silakan login kembali.' 
      });
    }

    // Pasang info user ke request object agar bisa dipakai di controller berikutnya
    req.user = sessionResult.rows[0];
    
    next();
  } catch (error) {
    console.error('[authMiddleware Error]', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan internal saat verifikasi sesi.' 
    });
  }
};

module.exports = authMiddleware;
