// ================================================================
// src/controllers/laporanController.js — Laporan Penjualan
// ================================================================
// Endpoint yang dipakai frontend:
//   GET  /api/laporan?dari=&sampai=  → LaporanMenu.jsx, LaporanPenjualan.jsx
//   GET  /api/laporan/summary        → 4 kartu statistik laporan
//   GET  /api/laporan/top-menu       → Pesanan Terbaru (menu terlaris)
//   GET  /api/laporan/chart          → Grafik Jumlah Pesanan (per hari)
//   GET  /api/laporan/export/excel   → Export Excel (simulasi CSV)
//   GET  /api/laporan/export/pdf     → Export PDF (response JSON data)
//
// Referensi dari LaporanMenu.jsx:
//   - Filter tanggal: dari, sampai
//   - Tombol Tampilkan → fetch data
//   - 4 kartu: Total Pesanan 125, Total Menu 64, Diproses 958, Terlaris
//   - Grafik Jumlah Pesanan (per hari dalam range)
//   - Tabel: tanggal, jumlahPesanan, jumlahItem
//   - Tombol Export Excel & Export PDF
// ================================================================
'use strict';

const pool = require('../config/db');

// ── GET /api/laporan?dari=&sampai= ────────────────────────────────
// Dipakai LaporanMenu.jsx & LaporanPenjualan.jsx tabel
exports.getLaporan = async (req, res) => {
  try {
    const flatRate = parseInt(process.env.FLAT_RATE) || 75000;
    // Default: 7 hari terakhir jika tidak ada parameter
    const dari    = req.query.dari    || new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
    const sampai  = req.query.sampai  || new Date().toISOString().split('T')[0];

    const [rows] = await pool.query(
      `SELECT
         DATE_FORMAT(DATE(p.waktu_pesan), '%d/%m/%Y') AS tanggal,
         DATE(p.waktu_pesan)                          AS tanggal_raw,
         COUNT(DISTINCT p.id_pesanan)                 AS jumlahPesanan,
         COALESCE(SUM(dp.jumlah), 0)                  AS jumlahItem,
         COUNT(DISTINCT CASE WHEN p.status_pesanan='Selesai' THEN p.id_pesanan END) * ? AS pendapatan
       FROM pesanan p
       LEFT JOIN detail_pesanan dp ON p.id_pesanan = dp.id_pesanan
       WHERE DATE(p.waktu_pesan) BETWEEN ? AND ?
       GROUP BY DATE(p.waktu_pesan)
       ORDER BY DATE(p.waktu_pesan) ASC`,
      [flatRate, dari, sampai]
    );

    return res.status(200).json({
      success: true,
      dari,
      sampai,
      total:   rows.length,
      data:    rows,
    });
  } catch (err) {
    console.error('[laporanController.getLaporan]', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil laporan.' });
  }
};

// ── GET /api/laporan/summary ──────────────────────────────────────
// 4 kartu statistik LaporanMenu.jsx:
//   Total Pesanan 125, Total Menu Terjual 64, Diproses 958, Terlaris
exports.getSummary = async (req, res) => {
  try {
    const dari   = req.query.dari   || new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
    const sampai = req.query.sampai || new Date().toISOString().split('T')[0];

    const [[totalPesanan], [totalItem], [diproses], [terlaris]] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS total FROM pesanan`,
        []
      ),
      pool.query(
        `SELECT COALESCE(SUM(dp.jumlah), 0) AS total
         FROM detail_pesanan dp
         JOIN pesanan p ON dp.id_pesanan = p.id_pesanan
         WHERE DATE(p.waktu_pesan) BETWEEN ? AND ?`,
        [dari, sampai]
      ),
      pool.query(
        `SELECT COUNT(*) AS total FROM pesanan
         WHERE status_pesanan IN ('Diproses','cooking','pending','Menunggu','ready')`,
        []
      ),
      pool.query(
        `SELECT m.nama_menu, SUM(dp.jumlah) AS total_qty
         FROM detail_pesanan dp
         JOIN pesanan p ON dp.id_pesanan = p.id_pesanan
         JOIN menu m ON dp.id_menu = m.id_menu
         WHERE DATE(p.waktu_pesan) BETWEEN ? AND ?
         GROUP BY m.id_menu, m.nama_menu
         ORDER BY total_qty DESC
         LIMIT 1`,
        [dari, sampai]
      ),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalPesanan: totalPesanan[0].total,
        totalItem:    totalItem[0].total,
        diproses:     diproses[0].total,
        terlaris:     terlaris[0]?.nama_menu || '-',
      },
    });
  } catch (err) {
    console.error('[laporanController.getSummary]', err);
    return res.status(500).json({ success: false, message: 'Gagal ambil summary.' });
  }
};

// ── GET /api/laporan/top-menu ─────────────────────────────────────
// Pesanan Terbaru (menu terlaris) — LaporanMenu.jsx ListItem
exports.getTopMenu = async (req, res) => {
  try {
    const dari   = req.query.dari   || new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
    const sampai = req.query.sampai || new Date().toISOString().split('T')[0];

    const [rows] = await pool.query(
      `SELECT m.nama_menu AS name, SUM(dp.jumlah) AS qty
       FROM detail_pesanan dp
       JOIN pesanan p ON dp.id_pesanan = p.id_pesanan
       JOIN menu m ON dp.id_menu = m.id_menu
       WHERE DATE(p.waktu_pesan) BETWEEN ? AND ?
       GROUP BY m.id_menu, m.nama_menu
       ORDER BY qty DESC
       LIMIT 5`,
      [dari, sampai]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('[laporanController.getTopMenu]', err);
    return res.status(500).json({ success: false, message: 'Gagal ambil top menu.' });
  }
};

// ── GET /api/laporan/chart ────────────────────────────────────────
// Grafik jumlah pesanan per hari — LaporanMenu.jsx chart
exports.getChart = async (req, res) => {
  try {
    const dari   = req.query.dari   || new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
    const sampai = req.query.sampai || new Date().toISOString().split('T')[0];

    const [rows] = await pool.query(
      `SELECT
         DATE_FORMAT(DATE(waktu_pesan), '%d/%m') AS label,
         COUNT(*) AS total
       FROM pesanan
       WHERE DATE(waktu_pesan) BETWEEN ? AND ?
       GROUP BY DATE(waktu_pesan)
       ORDER BY DATE(waktu_pesan) ASC`,
      [dari, sampai]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('[laporanController.getChart]', err);
    return res.status(500).json({ success: false, message: 'Gagal ambil data chart.' });
  }
};

// ── GET /api/laporan/export/pdf ───────────────────────────────────
// Kirim data JSON untuk frontend generate PDF dengan jsPDF
// Kolom sesuai tabel: Tanggal | Menu | Kategori | Terjual
exports.exportPdf = async (req, res) => {
  try {
    const dari   = req.query.dari   || new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
    const sampai = req.query.sampai || new Date().toISOString().split('T')[0];

    const [rows] = await pool.query(
      `SELECT
         DATE_FORMAT(DATE(p.waktu_pesan), '%d/%m/%Y') AS tanggal,
         m.nama_menu                                   AS menu,
         COALESCE(k.nama_kategori, '-')                AS kategori,
         SUM(dp.jumlah)                                AS terjual
       FROM detail_pesanan dp
       JOIN pesanan p  ON dp.id_pesanan = p.id_pesanan
       JOIN menu m     ON dp.id_menu    = m.id_menu
       LEFT JOIN kategori k ON m.id_kategori = k.id_kategori
       WHERE DATE(p.waktu_pesan) BETWEEN ? AND ?
       GROUP BY DATE(p.waktu_pesan), m.id_menu
       ORDER BY DATE(p.waktu_pesan) ASC, terjual DESC`,
      [dari, sampai]
    );

    const totalTerjual = rows.reduce((s, r) => s + Number(r.terjual), 0);

    return res.status(200).json({
      success:       true,
      nama_restoran: 'Bos Mentai & Dimsum',
      periode:       `${dari} s/d ${sampai}`,
      dicetak:       new Date().toLocaleDateString('id-ID', { dateStyle: 'full' }),
      total_terjual: totalTerjual,
      data:          rows,
    });
  } catch (err) {
    console.error('[laporanController.exportPdf]', err);
    return res.status(500).json({ success: false, message: 'Gagal export PDF.' });
  }
};

// ── GET /api/laporan/detail-menu ──────────────────────────────────
// Tabel per menu: Tanggal | Menu | Kategori | Terjual
exports.getDetailMenu = async (req, res) => {
  try {
    const dari   = req.query.dari   || new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
    const sampai = req.query.sampai || new Date().toISOString().split('T')[0];

    const [rows] = await pool.query(
      `SELECT
         DATE_FORMAT(DATE(p.waktu_pesan), '%d/%m/%Y') AS tanggal,
         m.nama_menu   AS menu,
         k.nama_kategori AS kategori,
         SUM(dp.jumlah)  AS terjual
       FROM detail_pesanan dp
       JOIN pesanan p ON dp.id_pesanan = p.id_pesanan
       JOIN menu m    ON dp.id_menu    = m.id_menu
       LEFT JOIN kategori k ON m.id_kategori = k.id_kategori
       WHERE DATE(p.waktu_pesan) BETWEEN ? AND ?
       GROUP BY DATE(p.waktu_pesan), m.id_menu
       ORDER BY DATE(p.waktu_pesan) ASC, terjual DESC`,
      [dari, sampai]
    );

    const totalTerjual = rows.reduce((s, r) => s + Number(r.terjual), 0);

    return res.status(200).json({
      success: true,
      dari,
      sampai,
      total: rows.length,
      totalTerjual,
      data: rows,
    });
  } catch (err) {
    console.error('[laporanController.getDetailMenu]', err);
    return res.status(500).json({ success: false, message: 'Gagal ambil detail menu.' });
  }
};