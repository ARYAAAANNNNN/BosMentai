// ================================================================
// src/routes/paymentRoutes.js — Midtrans Payment Routes
// ================================================================
'use strict';

const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// POST /api/payment/create-transaction → Create order + QRIS payment
router.post('/create-transaction', paymentController.createTransaction);

// GET  /api/payment/status/:orderId   → Frontend polling for status
router.get('/status/:orderId', paymentController.getTransactionStatus);

// POST /api/payment/notification      → Midtrans webhook callback
router.post('/notification', paymentController.handleNotification);

module.exports = router;
