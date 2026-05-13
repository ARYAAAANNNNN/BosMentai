'use strict';

const pool = require('../config/db');

// 1. GET SUMMARY (Untuk Dashboard & Card Stat)
exports.getSummary = async (req, res) => {
  try {
    const dari   = req.query.dari   || new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
    const sampai = req.query.sampai || new Date().toISOString().split('T')[0];

    const [totalPesanan, totalItem, diproses, terlaris] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM pesanan WHERE status_pesanan = 'Selesai' AND waktu_pesan::date BETWEEN $1 AND $2`, [dari, sampai]),
      pool.query(
        `SELECT COALESCE(SUM(dp.jumlah), 0) AS total
         FROM detail_pesanan dp
         JOIN pesanan p ON dp.id_pesanan = p.id_pesanan
         WHERE p.status_pesanan = 'Selesai' AND p.waktu_pesan::date BETWEEN $1 AND $2`,
        [dari, sampai]
      ),
      pool.query(`SELECT COUNT(*) AS total FROM pesanan WHERE status_pesanan NOT IN ('Selesai', 'Batal')`),
      pool.query(
        `SELECT m.nama_menu, SUM(dp.jumlah) AS total_qty
         FROM detail_pesanan dp
         JOIN pesanan p ON dp.id_pesanan = p.id_pesanan
         JOIN menu m ON dp.id_menu = m.id_menu
         WHERE p.status_pesanan = 'Selesai' AND p.waktu_pesan::date BETWEEN $1 AND $2
         GROUP BY m.nama_menu ORDER BY total_qty DESC LIMIT 1`,
        [dari, sampai]
      ),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalPesanan: parseInt(totalPesanan.rows[0].total),
        totalItem:    parseInt(totalItem.rows[0].total),
        diproses:     parseInt(diproses.rows[0].total),
        terlaris:     terlaris.rows[0]?.nama_menu || '-',
      },
    });
  } catch (err) {
    console.error('[laporanController.getSummary]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 2. FUNGSI PLACEHOLDER (Supaya Routes Tidak Error)
exports.getLaporan = async (req, res) => { res.json({ success: true, data: [] }); };
exports.getLaporanKategori = async (req, res) => { res.json({ success: true, data: [] }); };
exports.getTopMenu = async (req, res) => { res.json({ success: true, data: [] }); };
exports.getChart = async (req, res) => { res.json({ success: true, data: [] }); };
exports.getDetailMenu = async (req, res) => { res.json({ success: true, data: [] }); };
exports.exportPdf = async (req, res) => { res.json({ success: true, message: "Feature coming soon" }); };