// ================================================================
// src/routes/orderRoutes.js
// ================================================================
'use strict';

const express         = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

// GET  /api/orders              → Orders.jsx, KelolaPesanan.jsx list
router.get('/',             orderController.getAllOrders);

// GET  /api/orders/:id          → DetailPesanan.jsx
router.get('/:id',          orderController.getOrderById);

// POST /api/orders              → ConfirmPage.jsx kirim pesanan
router.post('/',            orderController.createOrder);

// PATCH /api/orders/:id/status  → Orders.jsx, KelolaPesanan.jsx, DetailPesanan.jsx
router.patch('/:id/status', orderController.updateStatus);

// DELETE /api/orders/:id        → Orders.jsx tombol Hapus
router.delete('/:id',       orderController.deleteOrder);

module.exports = router;


// ================================================================
// src/routes/statsRoutes.js — Simpan file ini terpisah!
// ================================================================
// CATATAN: File ini hanya satu modul untuk dipotong ke file terpisah.
// Salin bagian di bawah ini ke file src/routes/statsRoutes.js
/*
'use strict';
const express         = require('express');
const statsController = require('../controllers/statsController');
const router          = express.Router();

// GET /api/stats              → Dashboard.jsx (polling 5 detik)
router.get('/',               statsController.getStats);

// GET /api/stats/sales-chart  → SalesChart.jsx
router.get('/sales-chart',    statsController.getSalesChart);

// GET /api/stats/visitor-chart → VisitorChart.jsx
router.get('/visitor-chart',  statsController.getVisitorChart);

// GET /api/stats/recent-orders → RecentOrders.jsx
router.get('/recent-orders',  statsController.getRecentOrders);

// GET /api/stats/stat-cards   → StatCards.jsx
router.get('/stat-cards',     statsController.getStatCards);

module.exports = router;
*/