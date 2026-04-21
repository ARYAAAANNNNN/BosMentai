// ================================================================
// src/routes/statsRoutes.js
// ================================================================
'use strict';

const express         = require('express');
const statsController = require('../controllers/statsController');

const router = express.Router();

// Dashboard.jsx — polling setiap 5 detik
router.get('/',               statsController.getStats);

// SalesChart.jsx donut chart
router.get('/sales-chart',    statsController.getSalesChart);

// VisitorChart.jsx line chart
router.get('/visitor-chart',  statsController.getVisitorChart);

// RecentOrders.jsx 5 pesanan terbaru
router.get('/recent-orders',  statsController.getRecentOrders);

// StatCards.jsx 4 kartu KPI
router.get('/stat-cards',     statsController.getStatCards);

module.exports = router;