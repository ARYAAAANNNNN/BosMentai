'use strict';

const express = require('express');
const laporanController = require('../controllers/laporanController');
const router = express.Router();

router.get('/', laporanController.getLaporan);
router.get('/summary', laporanController.getSummary);
router.get('/kategori', laporanController.getLaporanKategori);
router.get('/top-menu', laporanController.getTopMenu);
router.get('/chart', laporanController.getChart);
router.get('/detail-menu', laporanController.getDetailMenu);
router.get('/export/pdf', laporanController.exportPdf);

module.exports = router;