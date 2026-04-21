// ================================================================
// server.js — Entry Point Server
// ================================================================
// File ini hanya bertugas START server di port yang dikonfigurasi
// Semua konfigurasi Express ada di app.js
// ================================================================
'use strict';

require('dotenv').config();

// UBAH PATH: Mundur satu folder ('../') buat manggil app.js yang ada di luar folder src
const app  = require('../app');

// UBAH PATH: Hapus tulisan 'src/' karena server.js udah ada di dalem folder src
require('./config/db');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('');
  console.log('================================================');
  console.log(`🚀  Server berjalan di: http://localhost:${PORT}`);
  console.log(`📋  Health check  : http://localhost:${PORT}/api/health`);
  console.log(`🍜  Menu API      : http://localhost:${PORT}/api/menus`);
  console.log(`📦  Orders API    : http://localhost:${PORT}/api/orders`);
  console.log(`📊  Stats API     : http://localhost:${PORT}/api/stats`);
  console.log(`📈  Laporan API   : http://localhost:${PORT}/api/laporan`);
  console.log('');
  console.log(`🌐  CORS diizinkan untuk:`);
  console.log(`     Admin    : ${process.env.CORS_ORIGIN_ADMIN || 'http://localhost:5174'}`);
  console.log(`     App User : ${process.env.CORS_ORIGIN_APP   || 'http://localhost:5173'}`);
  console.log('================================================');
  console.log('');
});