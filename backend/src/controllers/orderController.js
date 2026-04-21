// ================================================================
// src/controllers/orderController.js — Manajemen Pesanan
// ================================================================
// Endpoint yang dipakai frontend:
//   GET  /api/orders              → Orders.jsx, KelolaPesanan.jsx
//                                 → api.js orderAPI.getAll()
//   POST /api/orders              → ConfirmPage.jsx (kirim pesanan)
//                                 → api.js orderAPI.create()
//   PATCH /api/orders/:id/status  → Orders.jsx updateOrderStatus
//                                 → KelolaPesanan.jsx tombol Proses
//                                 → DetailPesanan.jsx handlePrint
//                                 → api.js orderAPI.updateStatus()
//   GET  /api/orders/:id          → DetailPesanan.jsx
//   DELETE /api/orders/:id        → Orders.jsx tombol Hapus
// ================================================================
'use strict';

const pool = require('../config/db');

const resolveStatus = (stok) => {
  if (stok === 0)  return 'habis';
  if (stok <= 5)   return 'hampir_habis';
  if (stok <= 20)  return 'menipis';
  return 'tersedia';
};

// ── GET /api/orders ───────────────────────────────────────────────
// Dipakai oleh Orders.jsx, KelolaPesanan.jsx
// Response: array pesanan dengan field yang cocok dengan frontend:
//   id, meja, menu (nama menu pertama), waktu, status, items[], totalItems
exports.getAllOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         p.id_pesanan                          AS id,
         p.no_meja                             AS meja,
         p.catatan,
         p.status_pesanan                      AS status,
         DATE_FORMAT(p.waktu_pesan, '%H:%i')   AS waktu,
         p.waktu_pesan,
         dp.id_detail,
         dp.id_menu,
         m.nama_menu                           AS name,
         m.nama_menu,
         m.gambar,
         dp.jumlah                             AS qty,
         dp.jumlah
       FROM pesanan p
       LEFT JOIN detail_pesanan dp ON p.id_pesanan = dp.id_pesanan
       LEFT JOIN menu m            ON dp.id_menu   = m.id_menu
       ORDER BY p.waktu_pesan DESC, p.id_pesanan`
    );

    // Group the results by order id
    const ordersMap = new Map();
    rows.forEach(row => {
      const orderId = row.id;
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          id: row.id,
          meja: row.meja,
          catatan: row.catatan,
          status: row.status,
          waktu: row.waktu,
          waktu_pesan: row.waktu_pesan,
          items: []
        });
      }
      if (row.id_detail) { // Only add if there's a detail
        ordersMap.get(orderId).items.push({
          id_detail: row.id_detail,
          id_menu: row.id_menu,
          name: row.name,
          nama_menu: row.nama_menu,
          gambar: row.gambar,
          qty: row.qty,
          jumlah: row.jumlah
        });
      }
    });

    const data = Array.from(ordersMap.values()).map(order => ({
      ...order,
      // 'menu' field untuk kolom tabel Orders.jsx (nama menu pertama)
      menu: order.items[0]?.nama_menu || order.items[0]?.name || '-',
      totalItems: order.items.reduce((sum, i) => sum + (i.qty || i.jumlah || 0), 0),
    }));

    return res.status(200).json({ success: true, total: data.length, data });
  } catch (err) {
    console.error('[orderController.getAllOrders]', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil pesanan.' });
  }
};

// ── GET /api/orders/:id ───────────────────────────────────────────
// Dipakai oleh DetailPesanan.jsx
exports.getOrderById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         p.id_pesanan AS id, p.no_meja AS meja, p.catatan,
         p.status_pesanan AS status,
         DATE_FORMAT(p.waktu_pesan, '%H:%i') AS waktu,
         p.waktu_pesan
       FROM pesanan p WHERE p.id_pesanan = ?`,
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });

    const [itemRows] = await pool.query(
      `SELECT dp.id_detail, dp.id_menu, dp.jumlah AS qty, dp.jumlah,
              m.nama_menu AS name, m.nama_menu, m.gambar
       FROM detail_pesanan dp
       LEFT JOIN menu m ON dp.id_menu = m.id_menu
       WHERE dp.id_pesanan = ?`,
      [req.params.id]
    );

    const order = {
      ...rows[0],
      items:      itemRows,
      totalItems: itemRows.reduce((s, i) => s + i.qty, 0),
      menu:       itemRows[0]?.name || '-',
    };

    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error('[orderController.getOrderById]', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil pesanan.' });
  }
};

// ── POST /api/orders ──────────────────────────────────────────────
// Dipakai oleh ConfirmPage.jsx / CartContext sendToKitchen
// Body: { no_meja: number, catatan: string, items: [{id_menu, jumlah}] }
exports.createOrder = async (req, res) => {
  const { no_meja, catatan, items } = req.body;

  const parsedMeja = parseInt(no_meja, 10);
  if (isNaN(parsedMeja) || parsedMeja < 1 || parsedMeja > 99)
    return res.status(422).json({ success: false, message: 'no_meja harus angka 1–99.' });

  if (!Array.isArray(items) || items.length === 0)
    return res.status(422).json({ success: false, message: 'items tidak boleh kosong.' });

  // Validasi tiap item
  for (let i = 0; i < items.length; i++) {
    const { id_menu, jumlah } = items[i];
    if (!Number.isInteger(id_menu) || id_menu <= 0)
      return res.status(422).json({ success: false, message: `items[${i}].id_menu harus integer positif.` });
    if (!Number.isInteger(jumlah) || jumlah <= 0 || jumlah > 255)
      return res.status(422).json({ success: false, message: `items[${i}].jumlah harus 1–255.` });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // INSERT header pesanan
    const [orderResult] = await conn.query(
      `INSERT INTO pesanan (no_meja, catatan, status_pesanan) VALUES (?, ?, 'Menunggu')`,
      [parsedMeja, catatan || null]
    );
    const id_pesanan    = orderResult.insertId;
    const successItems  = [];
    const failedItems   = [];

    for (const { id_menu, jumlah } of items) {
      // Lock row untuk cegah race condition (stok dibaca bersamaan)
      const [menuRows] = await conn.query(
        'SELECT id_menu, nama_menu, stok FROM menu WHERE id_menu = ? AND is_active = 1 FOR UPDATE',
        [id_menu]
      );

      if (!menuRows.length) {
        failedItems.push({ id_menu, alasan: 'Menu tidak ditemukan.' });
        continue;
      }

      const menu = menuRows[0];
      if (menu.stok < jumlah) {
        failedItems.push({
          id_menu,
          nama_menu:    menu.nama_menu,
          stok_tersisa: menu.stok,
          diminta:      jumlah,
          alasan:       'Stok tidak mencukupi.',
        });
        continue;
      }

      await conn.query(
        `INSERT INTO detail_pesanan (id_pesanan, id_menu, jumlah) VALUES (?, ?, ?)`,
        [id_pesanan, id_menu, jumlah]
      );

      const sisaStok   = menu.stok - jumlah;
      const statusBaru = resolveStatus(sisaStok);
      await conn.query(
        `UPDATE menu SET stok = stok - ?, status = ? WHERE id_menu = ? AND stok >= ?`,
        [jumlah, statusBaru, id_menu, jumlah]
      );

      successItems.push({ id_menu, nama_menu: menu.nama_menu, jumlah, sisa_stok: sisaStok });
    }

    if (successItems.length === 0) {
      await conn.rollback();
      return res.status(409).json({
        success: false,
        message: 'Semua item gagal diproses.',
        gagal:   failedItems,
      });
    }

    await conn.commit();
    return res.status(201).json({
      success:   true,
      message:   failedItems.length > 0
                   ? 'Pesanan disimpan, sebagian item dilewati.'
                   : 'Pesanan berhasil dibuat.',
      id_pesanan,
      no_meja:   parsedMeja,
      berhasil:  successItems,
      gagal:     failedItems,
    });
  } catch (err) {
    await conn.rollback();
    console.error('[orderController.createOrder]', err);
    return res.status(500).json({ success: false, message: 'Gagal memproses pesanan.' });
  } finally {
    conn.release();
  }
};

// ── PATCH /api/orders/:id/status ─────────────────────────────────
// Dipakai oleh:
//   - Orders.jsx: updateOrderStatus(id, 'Selesai')
//   - KelolaPesanan.jsx: tombol Proses → 'Selesai'
//   - DetailPesanan.jsx: handlePrint → 'Diproses'
//   - KitchenPage.jsx: 'cooking', 'ready'
//   - api.js: orderAPI.updateStatus(id, status)
const VALID_STATUS = ['pending', 'Menunggu', 'cooking', 'Diproses', 'ready', 'Selesai'];
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUS.includes(status))
    return res.status(422).json({
      success: false,
      message: `Status tidak valid. Pilihan: ${VALID_STATUS.join(', ')}`
    });

  try {
    const [result] = await pool.query(
      'UPDATE pesanan SET status_pesanan = ? WHERE id_pesanan = ?',
      [status, req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    return res.status(200).json({ success: true, message: `Status diubah ke "${status}".` });
  } catch (err) {
    console.error('[orderController.updateStatus]', err);
    return res.status(500).json({ success: false, message: 'Gagal update status.' });
  }
};

// ── DELETE /api/orders/:id ────────────────────────────────────────
// Dipakai oleh Orders.jsx tombol Hapus (status Selesai)
exports.deleteOrder = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM pesanan WHERE id_pesanan = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    return res.status(200).json({ success: true, message: 'Pesanan berhasil dihapus.' });
  } catch (err) {
    console.error('[orderController.deleteOrder]', err);
    return res.status(500).json({ success: false, message: 'Gagal menghapus pesanan.' });
  }
};