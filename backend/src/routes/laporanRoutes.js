// ================================================================
// src/routes/laporanRoutes.js
// ================================================================
'use strict';

const express            = require('express');
const laporanController  = require('../controllers/laporanController');

const router = express.Router();

// Tabel laporan — LaporanMenu.jsx & LaporanPenjualan.jsx
router.get('/',               laporanController.getLaporan);

// 4 kartu statistik — LaporanMenu.jsx CardStat
router.get('/summary',        laporanController.getSummary);

// Top menu terlaris — LaporanMenu.jsx ListItem
router.get('/top-menu',       laporanController.getTopMenu);

// Grafik per hari — LaporanMenu.jsx chart
router.get('/chart',          laporanController.getChart);

// Tabel per menu: Tanggal | Menu | Kategori | Terjual
router.get('/detail-menu',    laporanController.getDetailMenu);

// Export PDF data
router.get('/export/pdf',     laporanController.exportPdf);

module.exports = router;