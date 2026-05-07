'use strict';

const pool = require('../config/db');

const resolveStatus = (stok) => {
  if (stok === 0)  return 'habis';
  if (stok <= 5)   return 'hampir_habis';
  if (stok <= 20)  return 'menipis';
  return 'tersedia';
};

// ── GET /api/orders ───────────────────────────────────────────────
exports.getAllOrders = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         p.id_pesanan                              AS id,
         p.no_meja                                 AS meja,
         p.catatan,
         p.status_pesanan                          AS status,
         TO_CHAR(p.waktu_pesan, 'HH24:MI')         AS waktu,
         p.waktu_pesan,
         dp.id_detail,
         dp.id_menu,
         m.nama_menu                               AS name,
         m.nama_menu,
         m.gambar,
         dp.jumlah                                 AS qty,
         dp.jumlah
       FROM pesanan p
       LEFT JOIN detail_pesanan dp ON p.id_pesanan = dp.id_pesanan
       LEFT JOIN menu m            ON dp.id_menu   = m.id_menu
       ORDER BY p.waktu_pesan DESC, p.id_pesanan`
    );

    const ordersMap = new Map();
    rows.forEach(row => {
      const orderId = row.id;
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          id: row.id, meja: row.meja, catatan: row.catatan,
          status: row.status, waktu: row.waktu,
          waktu_pesan: row.waktu_pesan, items: []
        });
      }
      if (row.id_detail) {
        ordersMap.get(orderId).items.push({
          id_detail: row.id_detail, id_menu: row.id_menu,
          name: row.name, nama_menu: row.nama_menu,
          gambar: row.gambar, qty: row.qty, jumlah: row.jumlah
        });
      }
    });

    const data = Array.from(ordersMap.values()).map(order => ({
      ...order,
      menu: order.items[0]?.nama_menu || '-',
      totalItems: order.items.reduce((sum, i) => sum + (i.qty || 0), 0),
    }));

    return res.status(200).json({ success: true, total: data.length, data });
  } catch (err) {
    console.error('[orderController.getAllOrders]', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil pesanan.' });
  }
};

// ── GET /api/orders/:id ───────────────────────────────────────────
exports.getOrderById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         p.id_pesanan AS id, p.no_meja AS meja, p.catatan,
         p.status_pesanan AS status,
         TO_CHAR(p.waktu_pesan, 'HH24:MI') AS waktu,
         p.waktu_pesan
       FROM pesanan p WHERE p.id_pesanan = $1`,
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });

    const { rows: itemRows } = await pool.query(
      `SELECT dp.id_detail, dp.id_menu, dp.jumlah AS qty, dp.jumlah,
              m.nama_menu AS name, m.nama_menu, m.gambar
       FROM detail_pesanan dp
       LEFT JOIN menu m ON dp.id_menu = m.id_menu
       WHERE dp.id_pesanan = $1`,
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
exports.createOrder = async (req, res) => {
  const { no_meja, catatan, items } = req.body;

  const parsedMeja = parseInt(no_meja, 10);
  if (isNaN(parsedMeja) || parsedMeja < 1 || parsedMeja > 99)
    return res.status(422).json({ success: false, message: 'no_meja harus angka 1–99.' });

  if (!Array.isArray(items) || items.length === 0)
    return res.status(422).json({ success: false, message: 'items tidak boleh kosong.' });

  const conn = await pool.connect();
  try {
    await conn.query('BEGIN');
    console.log(`[orderController.createOrder] Starting for table ${parsedMeja}...`);

    // Single Receipt Logic: Look for an existing 'unpaid' order for this table
    const { rows: existingOrders } = await conn.query(
      `SELECT id_pesanan FROM pesanan 
       WHERE no_meja = $1 AND status_pesanan NOT IN ('Selesai')
       ORDER BY waktu_pesan DESC LIMIT 1`,
      [parsedMeja]
    );

    let id_pesanan;
    if (existingOrders.length > 0) {
      id_pesanan = existingOrders[0].id_pesanan;
      console.log(`[orderController.createOrder] Found existing order: ${id_pesanan}`);
      // Update catatan if provided
      if (catatan) {
        await conn.query(
          `UPDATE pesanan SET catatan = COALESCE(catatan, '') || ' | ' || $1 WHERE id_pesanan = $2`,
          [catatan, id_pesanan]
        );
      }
    } else {
      console.log(`[orderController.createOrder] Creating new order...`);
      const { rows: orderResult } = await conn.query(
        `INSERT INTO pesanan (no_meja, catatan, status_pesanan) VALUES ($1, $2, 'Menunggu') RETURNING id_pesanan`,
        [parsedMeja, catatan || null]
      );
      id_pesanan = orderResult[0].id_pesanan;
      console.log(`[orderController.createOrder] New order ID: ${id_pesanan}`);
    }

    const successItems = [];
    const failedItems  = [];
    let addedTotal = 0;

    console.log(`[orderController.createOrder] Processing ${items.length} items...`);

    for (const { id_menu, jumlah } of items) {
      console.log(`[orderController.createOrder] Checking menu ${id_menu} (qty: ${jumlah})...`);
      const { rows: menuRows } = await conn.query(
        'SELECT id_menu, nama_menu, stok, harga FROM menu WHERE id_menu = $1 AND is_active = 1 FOR UPDATE',
        [id_menu]
      );

      if (!menuRows.length) {
        console.warn(`[orderController.createOrder] Menu ${id_menu} not found or inactive.`);
        failedItems.push({ id_menu, alasan: 'Menu tidak ditemukan.' });
        continue;
      }

      const menu = menuRows[0];
      if (menu.stok < jumlah) {
        failedItems.push({
          id_menu, nama_menu: menu.nama_menu,
          stok_tersisa: menu.stok, diminta: jumlah,
          alasan: 'Stok tidak mencukupi.',
        });
        continue;
      }

      const subtotal = menu.harga * jumlah;
      addedTotal += subtotal;

      // Check if item already exists in this order
      const { rows: existingDetail } = await conn.query(
        `SELECT id_detail, jumlah FROM detail_pesanan WHERE id_pesanan = $1 AND id_menu = $2`,
        [id_pesanan, id_menu]
      );

      if (existingDetail.length > 0) {
        console.log(`[orderController.createOrder] Updating existing detail ${existingDetail[0].id_detail}`);
        await conn.query(
          `UPDATE detail_pesanan SET jumlah = jumlah + $1, subtotal = subtotal + $2 WHERE id_detail = $3`,
          [jumlah, subtotal, existingDetail[0].id_detail]
        );
      } else {
        console.log(`[orderController.createOrder] Inserting new detail for menu ${id_menu}`);
        await conn.query(
          `INSERT INTO detail_pesanan (id_pesanan, id_menu, jumlah, harga_satuan, subtotal) VALUES ($1, $2, $3, $4, $5)`,
          [id_pesanan, id_menu, jumlah, menu.harga, subtotal]
        );
      }

      const sisaStok   = menu.stok - jumlah;
      const statusBaru = resolveStatus(sisaStok);
      console.log(`[orderController.createOrder] Updating stock for ${menu.nama_menu} to ${sisaStok}`);
      await conn.query(
        `UPDATE menu SET stok = stok - $1, status = $2, total_dipesan = total_dipesan + $1 WHERE id_menu = $3`,
        [jumlah, statusBaru, id_menu]
      );

      successItems.push({ id_menu, nama_menu: menu.nama_menu, jumlah, sisa_stok: sisaStok });
    }

    if (successItems.length === 0) {
      await conn.query('ROLLBACK');
      return res.status(409).json({
        success: false, message: 'Semua item gagal diproses.', gagal: failedItems,
      });
    }

    // Update total_harga in pesanan
    await conn.query(
      `UPDATE pesanan SET total_harga = total_harga + $1 WHERE id_pesanan = $2`,
      [addedTotal, id_pesanan]
    );

    await conn.query('COMMIT');
    console.log(`[orderController.createOrder] Success! ID: ${id_pesanan}`);
    return res.status(201).json({
      success:   true,
      message:   failedItems.length > 0 ? 'Pesanan disimpan, sebagian item dilewati.' : 'Pesanan berhasil dibuat.',
      id_pesanan, no_meja: parsedMeja,
      berhasil: successItems, gagal: failedItems,
    });
  } catch (err) {
    if (conn) await conn.query('ROLLBACK');
    console.error('[orderController.createOrder] Fatal Error:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal memproses pesanan: ' + err.message,
      debug: err.message,
      stack: err.stack
    });
  } finally {
    if (conn) conn.release();
  }
};

// ── PATCH /api/orders/:id/status ─────────────────────────────────
const VALID_STATUS = ['pending', 'Menunggu', 'cooking', 'Diproses', 'ready', 'Selesai'];
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUS.includes(status))
    return res.status(422).json({
      success: false,
      message: `Status tidak valid. Pilihan: ${VALID_STATUS.join(', ')}`
    });

  try {
    const result = await pool.query(
      'UPDATE pesanan SET status_pesanan = $1 WHERE id_pesanan = $2',
      [status, req.params.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    return res.status(200).json({ success: true, message: `Status diubah ke "${status}".` });
  } catch (err) {
    console.error('[orderController.updateStatus]', err);
    return res.status(500).json({ success: false, message: 'Gagal update status.' });
  }
};

// ── DELETE /api/orders/:id ────────────────────────────────────────
exports.deleteOrder = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM pesanan WHERE id_pesanan = $1',
      [req.params.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    return res.status(200).json({ success: true, message: 'Pesanan berhasil dihapus.' });
  } catch (err) {
    console.error('[orderController.deleteOrder]', err);
    return res.status(500).json({ success: false, message: 'Gagal menghapus pesanan.' });
  }
};