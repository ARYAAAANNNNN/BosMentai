'use strict';

const pool = require('../config/db');
const midtransClient = require('midtrans-client');

// ── Midtrans Core API Client ─────────────────────────────────────
const core = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

// ── Helper: resolve stock status ──────────────────────────────────
const resolveStatus = (stok) => {
  if (stok === 0) return 'habis';
  if (stok <= 5) return 'hampir_habis';
  if (stok <= 20) return 'menipis';
  return 'tersedia';
};

// ══════════════════════════════════════════════════════════════════
// POST /api/payment/create-transaction
// Creates order + Midtrans QRIS charge in one step
// Body: { no_meja, catatan, items: [{ id_menu, jumlah }] }
// ══════════════════════════════════════════════════════════════════
exports.createTransaction = async (req, res) => {
  const { no_meja, catatan, items } = req.body;

  const parsedMeja = parseInt(no_meja, 10);
  if (isNaN(parsedMeja) || parsedMeja < 1 || parsedMeja > 99)
    return res.status(422).json({ success: false, message: 'no_meja harus angka 1–99.' });

  if (!Array.isArray(items) || items.length === 0)
    return res.status(422).json({ success: false, message: 'items tidak boleh kosong.' });

  if (!process.env.MIDTRANS_SERVER_KEY) {
    return res.status(500).json({ success: false, message: 'Midtrans belum dikonfigurasi. Set MIDTRANS_SERVER_KEY di .env' });
  }

  const conn = await pool.connect();
  try {
    await conn.query('BEGIN');

    // ── Step 1: Create Order ──────────────────────────────────────
    const { rows: orderResult } = await conn.query(
      `INSERT INTO pesanan (no_meja, catatan, status_pesanan, status_pembayaran)
       VALUES ($1, $2, 'Menunggu Konfirmasi', 'unpaid') RETURNING id_pesanan`,
      [parsedMeja, catatan || null]
    );
    const id_pesanan = orderResult[0].id_pesanan;

    let totalAmount = 0;
    const successItems = [];

    for (const { id_menu, jumlah } of items) {
      const { rows: menuRows } = await conn.query(
        'SELECT id_menu, nama_menu, stok, harga FROM menu WHERE id_menu = $1 AND is_active = 1 FOR UPDATE',
        [id_menu]
      );

      if (!menuRows.length) continue;

      const menu = menuRows[0];
      if (menu.stok < jumlah) continue;

      const subtotal = menu.harga * jumlah;
      totalAmount += subtotal;

      await conn.query(
        `INSERT INTO detail_pesanan (id_pesanan, id_menu, jumlah, harga_satuan, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [id_pesanan, id_menu, jumlah, menu.harga, subtotal]
      );

      const sisaStok = menu.stok - jumlah;
      await conn.query(
        `UPDATE menu SET stok = stok - $1, status = $2, total_dipesan = total_dipesan + $1 WHERE id_menu = $3`,
        [jumlah, resolveStatus(sisaStok), id_menu]
      );

      successItems.push({ id_menu, nama_menu: menu.nama_menu, jumlah, harga: menu.harga });
    }

    if (successItems.length === 0) {
      await conn.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Semua item gagal diproses.' });
    }

    // Update total_harga
    await conn.query(
      `UPDATE pesanan SET total_harga = $1 WHERE id_pesanan = $2`,
      [totalAmount, id_pesanan]
    );

    // ── Step 2: Create Midtrans QRIS Charge ───────────────────────
    const orderId = `BM-${id_pesanan}-${Date.now()}`;

    const chargeParam = {
      payment_type: 'qris',
      transaction_details: {
        order_id: orderId,
        gross_amount: totalAmount,
      },
      qris: {
        acquirer: 'gopay',
      },
      item_details: successItems.map(item => ({
        id: String(item.id_menu),
        name: item.nama_menu.substring(0, 50),
        price: item.harga,
        quantity: item.jumlah,
      })),
    };

    console.log('[paymentController] Charging Midtrans QRIS:', orderId, 'Amount:', totalAmount);
    const chargeResponse = await core.charge(chargeParam);
    console.log('[paymentController] Midtrans response:', JSON.stringify(chargeResponse).substring(0, 500));

    // Extract QR code URL
    let qrUrl = null;
    if (chargeResponse.actions && chargeResponse.actions.length > 0) {
      const qrAction = chargeResponse.actions.find(a => a.name === 'generate-qr-code');
      qrUrl = qrAction ? qrAction.url : chargeResponse.actions[0].url;
    }

    // Calculate expiry (15 minutes from now)
    const expiredAt = new Date(Date.now() + 15 * 60 * 1000);

    // ── Step 3: Store Transaction ─────────────────────────────────
    await conn.query(
      `INSERT INTO transactions (id_pesanan, order_id, gross_amount, payment_type, transaction_id, transaction_status, qr_url, midtrans_response, expired_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id_pesanan, orderId, totalAmount, 'qris',
        chargeResponse.transaction_id || null,
        chargeResponse.transaction_status || 'pending',
        qrUrl,
        JSON.stringify(chargeResponse),
        expiredAt,
      ]
    );

    await conn.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Transaksi berhasil dibuat.',
      data: {
        id_pesanan,
        order_id: orderId,
        gross_amount: totalAmount,
        qr_url: qrUrl,
        transaction_status: chargeResponse.transaction_status || 'pending',
        expired_at: expiredAt.toISOString(),
        items: successItems,
      },
    });
  } catch (err) {
    if (conn) await conn.query('ROLLBACK');
    console.error('[paymentController.createTransaction]', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat transaksi: ' + err.message,
    });
  } finally {
    if (conn) conn.release();
  }
};

// ══════════════════════════════════════════════════════════════════
// GET /api/payment/status/:orderId
// Frontend polling endpoint — check payment status
// ══════════════════════════════════════════════════════════════════
exports.getTransactionStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const { rows } = await pool.query(
      `SELECT t.*, p.status_pesanan, p.status_pembayaran, p.no_meja
       FROM transactions t
       JOIN pesanan p ON t.id_pesanan = p.id_pesanan
       WHERE t.order_id = $1`,
      [orderId]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan.' });
    }

    const trx = rows[0];
    return res.status(200).json({
      success: true,
      data: {
        order_id: trx.order_id,
        id_pesanan: trx.id_pesanan,
        gross_amount: parseFloat(trx.gross_amount),
        transaction_status: trx.transaction_status,
        status_pesanan: trx.status_pesanan,
        status_pembayaran: trx.status_pembayaran,
        qr_url: trx.qr_url,
        expired_at: trx.expired_at,
        created_at: trx.created_at,
      },
    });
  } catch (err) {
    console.error('[paymentController.getTransactionStatus]', err);
    return res.status(500).json({ success: false, message: 'Gagal cek status.' });
  }
};

// ══════════════════════════════════════════════════════════════════
// POST /api/payment/notification
// Midtrans Webhook Handler
// ══════════════════════════════════════════════════════════════════
exports.handleNotification = async (req, res) => {
  try {
    const notification = req.body;
    console.log('[paymentController.webhook] Received:', JSON.stringify(notification).substring(0, 500));

    // Verify notification with Midtrans SDK
    const statusResponse = await core.transaction.notification(notification);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`[paymentController.webhook] Order: ${orderId}, Status: ${transactionStatus}, Fraud: ${fraudStatus}`);

    // Determine payment status
    let dbStatus = transactionStatus;
    let pembayaranStatus = 'unpaid';

    if (transactionStatus === 'settlement') {
      pembayaranStatus = 'paid';
    } else if (transactionStatus === 'capture') {
      pembayaranStatus = fraudStatus === 'accept' ? 'paid' : 'unpaid';
      dbStatus = fraudStatus === 'accept' ? 'settlement' : 'deny';
    } else if (['deny', 'cancel', 'expire'].includes(transactionStatus)) {
      pembayaranStatus = 'failed';
    }

    // Update transactions table
    await pool.query(
      `UPDATE transactions 
       SET transaction_status = $1, midtrans_response = $2, updated_at = NOW()
       WHERE order_id = $3`,
      [dbStatus, JSON.stringify(statusResponse), orderId]
    );

    // Update pesanan table
    const { rows } = await pool.query(
      `SELECT id_pesanan FROM transactions WHERE order_id = $1`,
      [orderId]
    );

    if (rows.length > 0) {
      const updateFields = { status_pembayaran: pembayaranStatus };

      // If paid, keep status as 'Menunggu Konfirmasi' — admin will manually confirm
      if (pembayaranStatus === 'paid') {
        updateFields.status_pesanan = 'Menunggu Konfirmasi';
      }

      await pool.query(
        `UPDATE pesanan SET status_pembayaran = $1, status_pesanan = COALESCE($2, status_pesanan) WHERE id_pesanan = $3`,
        [updateFields.status_pembayaran, updateFields.status_pesanan || null, rows[0].id_pesanan]
      );

      console.log(`[paymentController.webhook] Updated pesanan ${rows[0].id_pesanan}: pembayaran=${pembayaranStatus}`);
    }

    // Midtrans expects 200 OK
    return res.status(200).json({ success: true, message: 'Notification processed.' });
  } catch (err) {
    console.error('[paymentController.handleNotification]', err);
    // Still return 200 to prevent Midtrans from retrying
    return res.status(200).json({ success: false, message: err.message });
  }
};
