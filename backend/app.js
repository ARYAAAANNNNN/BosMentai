// app.js — Entry point aplikasi Express
'use strict';

require('dotenv').config(); // Muat .env sebelum modul lain mengakses process.env

const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const menuRoutes   = require('./src/routes/menuRoutes');
const orderRoutes  = require('./src/routes/orderroutes');
const statsRoutes  = require('./src/routes/statsRoutes');
const laporanRoutes = require('./src/routes/laporanRoutes');
const authRoutes    = require('./src/routes/authRoutes');


const app  = express();
const PORT = process.env.PORT || 3000;

// =============================================================
// LAYER KEAMANAN GLOBAL
// =============================================================

// Helmet: set berbagai HTTP security header sekaligus
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS: batasi domain yang boleh mengakses API
const allowedOrigins = [
  process.env.CORS_ORIGIN_ADMIN,
  process.env.CORS_ORIGIN_APP,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan jika origin kosong (Postman), ada di daftar, atau domain vercel.app
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        console.error(`[CORS Blocked] Origin: ${origin}`);
        callback(null, false); // Ganti error dengan false agar browser yang menangani
      }
    },
    methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate Limiting: cegah brute-force & DDoS ringan
// Dinaikkan ke 5000 agar polling dari banyak device/tab tidak terblokir
app.use(
  rateLimit({
    windowMs:         15 * 60 * 1000,
    max:              5000, 
    standardHeaders:  true,
    legacyHeaders:    false,
    message: { success: false, message: 'Terlalu banyak request. Coba lagi dalam 15 menit.' },
  })
);

// Body parser: batasi ukuran JSON body untuk mencegah payload bombing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Sajikan folder upload sebagai static files
// URL akses: GET /uploads/menus/<filename>
// Multer menyimpan ke: src/public/uploads  →  path sesuai __dirname (backend/)
app.use('/uploads', express.static(path.join(__dirname, 'src', 'public', 'uploads')));

// =============================================================
// MOUNT ROUTES
// =============================================================
app.use('/api/menus',   menuRoutes);
app.use('/api/orders',  orderRoutes);
app.use('/api/stats',   statsRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/auth',    authRoutes);


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