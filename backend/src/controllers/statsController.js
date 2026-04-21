// ================================================================
// src/controllers/statsController.js — Data Dashboard
// ================================================================
// Endpoint yang dipakai frontend:
//   GET /api/stats → Dashboard.jsx fetch('http://localhost:5000/api/stats')
//
// PERHATIAN dari Dashboard.jsx:
//   const response = await fetch("http://localhost:5000/api/stats");
//   → Frontend menggunakan port 5000, bukan 3000!
//   → Kita set server di port 3000 (.env), tapi kita juga perlu
//     handle alias port ini.
//   → Solusi: Tambahkan /api/stats ke server 3000
//     dan suruh frontend ubah ke http://localhost:3000/api/stats
//
// Response yang dibutuhkan Dashboard.jsx (INITIAL_STATS):
//   { success, data: {
//       totalPesananHariIni, pesananDariKemarin, totalMenu,
//       totalPengunjung, pengunjungHariIni, pengunjungMingguIni,
//       pendapatanHariIni
//   }}
// ================================================================
'use strict';

const pool = require('../config/db');

// ── GET /api/stats ────────────────────────────────────────────────
// Dipakai Dashboard.jsx — polling setiap 5 detik
exports.getStats = async (_req, res) => {
  try {
    const flatRate = parseInt(process.env.FLAT_RATE) || 75000;

    // Semua query dijalankan paralel untuk performa maksimal
    const [
      [pesananHariIni],
      [pesananKemarin],
      [totalMenu],
      [pengunjungTotal],
      [pengunjungHariIni],
      [pengunjungMinggu],
      [pendapatan],
    ] = await Promise.all([
      // Total pesanan hari ini
      pool.query(
        `SELECT COUNT(*) AS total FROM pesanan
         WHERE DATE(waktu_pesan) = CURDATE()`
      ),
      // Total pesanan kemarin (untuk hitung selisih)
      pool.query(
        `SELECT COUNT(*) AS total FROM pesanan
         WHERE DATE(waktu_pesan) = CURDATE() - INTERVAL 1 DAY`
      ),
      // Total menu aktif (stok > 0)
      pool.query(
        `SELECT COUNT(*) AS total FROM menu
         WHERE is_active = 1 AND status != 'habis'`
      ),
      // Total pengunjung (dari visitor_log)
      pool.query(
        `SELECT COUNT(*) AS total FROM visitor_log`
      ),
      // Pengunjung hari ini
      pool.query(
        `SELECT COUNT(*) AS total FROM visitor_log
         WHERE tanggal = CURDATE()`
      ),
      // Pengunjung minggu ini
      pool.query(
        `SELECT COUNT(*) AS total FROM visitor_log
         WHERE YEARWEEK(tanggal, 1) = YEARWEEK(CURDATE(), 1)`
      ),
      // Pendapatan hari ini (flat rate × pesanan Selesai hari ini)
      pool.query(
        `SELECT COUNT(*) AS total FROM pesanan
         WHERE DATE(waktu_pesan) = CURDATE()
           AND status_pesanan = 'Selesai'`
      ),
    ]);

    const totalHariIni = pesananHariIni[0].total;
    const totalKemarin = pesananKemarin[0].total;

    return res.status(200).json({
      success: true,
      data: {
        totalPesananHariIni: totalHariIni,
        pesananDariKemarin:  totalHariIni - totalKemarin,
        totalMenu:           totalMenu[0].total,
        totalPengunjung:     pengunjungTotal[0].total,
        pengunjungHariIni:   pengunjungHariIni[0].total,
        pengunjungMingguIni: pengunjungMinggu[0].total,
        pendapatanHariIni:   pendapatan[0].total * flatRate,
      },
    });
  } catch (err) {
    console.error('[statsController.getStats]', err);
    // Jika DB belum siap, kembalikan data default agar UI tidak kosong
    return res.status(200).json({
      success: true,
      data: {
        totalPesananHariIni: 0,
        pesananDariKemarin:  0,
        totalMenu:           0,
        totalPengunjung:     0,
        pengunjungHariIni:   0,
        pengunjungMingguIni: 0,
        pendapatanHariIni:   0,
      },
    });
  }
};

// ── GET /api/stats/sales-chart ────────────────────────────────────
// Dipakai SalesChart.jsx — persentase per kategori
exports.getSalesChart = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         CASE
           WHEN k.id_kategori IN (1,2,3,7) THEN 'Dimsum'
           WHEN k.id_kategori = 4           THEN 'Goreng'
           WHEN k.id_kategori = 6           THEN 'Dessert'
           WHEN k.id_kategori = 5           THEN 'Minuman'
           ELSE                                  'Menu Lain'
         END AS name,
         CASE
           WHEN k.id_kategori IN (1,2,3,7) THEN '#B34949'
           WHEN k.id_kategori = 4           THEN '#E87A7A'
           WHEN k.id_kategori = 6           THEN '#D4B5B5'
           WHEN k.id_kategori = 5           THEN '#9E9E9E'
           ELSE                                  '#CACACA'
         END AS color,
         SUM(dp.jumlah) AS total
       FROM detail_pesanan dp
       JOIN menu m ON dp.id_menu = m.id_menu
       JOIN kategori k ON m.id_kategori = k.id_kategori
       GROUP BY name, color
       ORDER BY total DESC`
    );

    const grandTotal = rows.reduce((s, r) => s + Number(r.total), 0);
    const data = rows.map(r => ({
      name:  r.name,
      color: r.color,
      value: grandTotal > 0 ? Math.round(r.total / grandTotal * 100 * 10) / 10 : 0,
    }));

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[statsController.getSalesChart]', err);
    return res.status(500).json({ success: false, message: 'Gagal ambil data chart.' });
  }
};

// ── GET /api/stats/visitor-chart ──────────────────────────────────
// Dipakai VisitorChart.jsx — data [{date, visitors}]
exports.getVisitorChart = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         DATE_FORMAT(tanggal, '%e %b') AS date,
         COUNT(*)                       AS visitors
       FROM visitor_log
       GROUP BY tanggal
       ORDER BY tanggal ASC
       LIMIT 30`
    );
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('[statsController.getVisitorChart]', err);
    return res.status(500).json({ success: false, message: 'Gagal ambil visitor chart.' });
  }
};

// ── GET /api/stats/recent-orders ─────────────────────────────────
// Dipakai RecentOrders.jsx — 5 pesanan terbaru
exports.getRecentOrders = async (_req, res) => {
  try {
    const colors = ['bg-red-100','bg-orange-100','bg-yellow-100','bg-teal-100','bg-purple-100'];
    const [rows] = await pool.query(
      `SELECT
         p.id_pesanan AS id,
         CONCAT('Meja ', p.no_meja) AS table_name,
         MIN(m.nama_menu)           AS item,
         DATE_FORMAT(p.waktu_pesan, '%H:%i') AS time,
         p.no_meja,
         p.status_pesanan           AS status
       FROM pesanan p
       LEFT JOIN detail_pesanan dp ON p.id_pesanan = dp.id_pesanan
       LEFT JOIN menu m ON dp.id_menu = m.id_menu
       GROUP BY p.id_pesanan, p.no_meja, p.waktu_pesan, p.status_pesanan
       ORDER BY p.waktu_pesan DESC
       LIMIT 5`
    );

    const data = rows.map(r => ({
      ...r,
      table: r.table_name,
      color: colors[r.no_meja % 5],
    }));

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[statsController.getRecentOrders]', err);
    return res.status(500).json({ success: false, message: 'Gagal ambil recent orders.' });
  }
};

// ── GET /api/stats/stat-cards ─────────────────────────────────────
// Dipakai StatCards.jsx — 4 kartu statistik
exports.getStatCards = async (_req, res) => {
  try {
    const flatRate = parseInt(process.env.FLAT_RATE) || 75000;
    const [[bulanIni], [bulanLalu], [pelanggan], [pendapatan]] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS total FROM pesanan
         WHERE YEAR(waktu_pesan)=YEAR(CURDATE())
           AND MONTH(waktu_pesan)=MONTH(CURDATE())`
      ),
      pool.query(
        `SELECT COUNT(*) AS total FROM pesanan
         WHERE waktu_pesan >= DATE_FORMAT(CURDATE()-INTERVAL 1 MONTH,'%Y-%m-01')
           AND waktu_pesan  < DATE_FORMAT(CURDATE(),'%Y-%m-01')`
      ),
      pool.query(
        `SELECT COUNT(DISTINCT no_meja) AS total FROM pesanan
         WHERE YEAR(waktu_pesan)=YEAR(CURDATE())
           AND MONTH(waktu_pesan)=MONTH(CURDATE())`
      ),
      pool.query(
        `SELECT COUNT(*) AS total FROM pesanan
         WHERE YEAR(waktu_pesan)=YEAR(CURDATE())
           AND MONTH(waktu_pesan)=MONTH(CURDATE())
           AND status_pesanan='Selesai'`
      ),
    ]);

    const totalBulanIni  = bulanIni[0].total;
    const totalBulanLalu = bulanLalu[0].total;
    const pertumbuhan    = totalBulanLalu > 0
      ? Math.round((totalBulanIni - totalBulanLalu) / totalBulanLalu * 100 * 100) / 100
      : null;

    return res.status(200).json({
      success: true,
      data: {
        total_pesanan:   totalBulanIni,
        pelanggan:       pelanggan[0].total,
        pendapatan:      pendapatan[0].total * flatRate,
        pertumbuhan_pct: pertumbuhan,
      },
    });
  } catch (err) {
    console.error('[statsController.getStatCards]', err);
    return res.status(500).json({ success: false, message: 'Gagal ambil stat cards.' });
  }
};