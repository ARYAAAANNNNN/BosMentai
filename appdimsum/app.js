// app.js — Entry point aplikasi Express
'use strict';

require('dotenv').config(); // Muat .env sebelum modul lain mengakses process.env

const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const menuRoutes  = require('./src/routes/menuRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

// =============================================================
// LAYER KEAMANAN GLOBAL
// =============================================================

// Helmet: set berbagai HTTP security header sekaligus
// (X-Content-Type-Options, X-Frame-Options, dll)
app.use(helmet());

// CORS: batasi domain yang boleh mengakses API
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (misal: Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin '${origin}' tidak diizinkan.`));
      }
    },
    methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate Limiting: cegah brute-force & DDoS ringan
// Tiap IP dibatasi 120 request per 15 menit
app.use(
  rateLimit({
    windowMs:         15 * 60 * 1000,
    max:              120,
    standardHeaders:  true,  // Kirim info limit di header RateLimit-*
    legacyHeaders:    false,
    message: { success: false, message: 'Terlalu banyak request. Coba lagi dalam 15 menit.' },
  })
);

// Body parser: batasi ukuran JSON body untuk mencegah payload bombing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Sajikan folder upload sebagai static files
// URL akses: GET /uploads/menus/<filename>
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// =============================================================
// MOUNT ROUTES
// =============================================================
app.use('/api/menus',  menuRoutes);
app.use('/api/orders', orderRoutes);

// Health check — berguna untuk monitoring & Docker healthcheck
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

// Catch-all untuk endpoint yang tidak terdaftar (404)
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.' });
});

// Global error handler (error yang di-next() dari middleware/route)
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[GlobalErrorHandler]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal server.',
  });
});

// =============================================================
// START SERVER (Dihapus karena server jalan dari server.js)
// =============================================================

module.exports = app;