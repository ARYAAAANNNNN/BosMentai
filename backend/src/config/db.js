// ================================================================
// src/config/db.js — Koneksi MySQL XAMPP dengan Connection Pool
// ================================================================
// Pool lebih efisien dari single connection karena:
//   - Bisa tangani banyak request bersamaan tanpa antre
//   - Otomatis re-connect jika koneksi putus
//   - Batas maksimal koneksi bisa dikonfigurasi
// ================================================================
'use strict';

const mysql  = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'dimsum_house',
  waitForConnections: true,
  connectionLimit:    10,   // maksimal 10 koneksi bersamaan
  queueLimit:         0,    // 0 = antrean tak terbatas
  enableKeepAlive:    true,
  keepAliveInitialDelay: 0,
});

// ── Test koneksi saat server start ───────────────────────────────
pool.getConnection()
  .then(conn => {
    console.log(`✅  MySQL terhubung ke database: "${process.env.DB_NAME}"`);
    conn.release();
  })
  .catch(err => {
    console.error('❌  Gagal konek MySQL:', err.message);
    console.error('    → Pastikan XAMPP MySQL sudah Start (hijau)');
    console.error('    → Cek DB_NAME, DB_USER, DB_PASSWORD di file .env');
  });

module.exports = pool;