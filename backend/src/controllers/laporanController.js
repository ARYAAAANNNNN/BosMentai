'use strict';

const pool = require('../config/db');

// ── GET /api/laporan?dari=&sampai= ────────────────────────────────
exports.getLaporan = async (req, res) => {
  try {
    const flatRate = parseInt(process.env.FLAT_RATE) || 75000;
    const dari   = req.query.dari   || new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
    const sampai = req.query.sampai || new Date().toISOString().split('T')[0];

    const { rows } = await pool.query(
      `SELECT
         TO_CHAR(p.waktu_pesan::date, 'DD/MM/YYYY')  AS tanggal,
         p.waktu_pesan::date                          AS tanggal_raw,
         COUNT(DISTINCT p.id_pesanan)                 AS jumlahpesanan,
         COALESCE(SUM(dp.jumlah), 0)                  AS jumlahitem,
         COUNT(DISTINCT CASE WHEN p.status_pesanan='Selesai' THEN p.id_pesanan END) * $1 AS pendapatan
       FROM pesanan p
       LEFT JOIN detail_pesanan dp ON p.id_pesanan = dp.id_pesanan
       WHERE p.waktu_pesan::date BETWEEN $2 AND $3
       GROUP BY p.waktu_pesan::date
       ORDER BY p.waktu_pesan::date ASC`,
      [flatRate, dari, sampai]
    );

    const data = rows.map(r => ({
      ...r,
      jumlahPesanan: parseInt(r.jumlahpesanan),
      jumlahItem:    parseInt(r.jumlahitem),
    }));

    return res.status(200).json({ success: true, dari, sampai, total: data.length, data });
  } catch (err) {
    console.error('[laporanController.getLaporan]', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil laporan.' });
  }
};

// ── GET /api/laporan/summary ──────────────────────────────────────
exports.getSummary = async (req, res) => {
  try {
    const dari   = req.query.dari   || new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
    const sampai = req.query.sampai || new Date().toISOString().split('T')[0];

    const [totalPesanan, totalItem, diproses, terlaris] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM pesanan`),
      pool.query(
        `SELECT COALESCE(SUM(dp.jumlah), 0) AS total
         FROM detail_pesanan dp
         JOIN pesanan p ON dp.id_pesanan = p.id_pesanan
         WHERE p.waktu_pesan::date BETWEEN $1 AND $2`,
        [dari, sampai]
      ),
      pool.query(
        `SELECT COUNT(*) AS total FROM pesanan
         WHERE status_pesanan IN ('Diproses','cooking','pending','Menunggu','ready')`
      ),
      pool.query(
        `SELECT m.nama_menu, SUM(dp.jumlah) AS total_qty
         FROM detail_pesanan dp
         JOIN pesanan p ON dp.id_pesanan = p.id_pesanan
         JOIN menu m ON dp.id_menu = m.id_menu
         WHERE p.waktu_pesan::date BETWEEN $1 AND $2
         GROUP BY m.id_menu, m.nama_menu
         ORDER BY total_qty DESC
         LIMIT 1`,
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
    return res.status(500).json({ success: false, message: 'Gagal ambil summary.' });
  }
};

// ── GET /api/laporan/top-menu ─────────────────────────────────────
exports.getTopMenu = async (req, res) => {
  try {
    const dari   = req.query.dari   || new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
    const sampai = req.query.sampai || new Date().toISOString().split('T')[0];

    const { rows } = await pool.query(
      `SELECT m.nama_menu AS name, SUM(dp.jumlah) AS qty
       FROM detail_pesanan dp
       JOIN pesanan p ON dp.id_pesanan = p.id_pesanan
       JOIN menu m ON dp.id_menu = m.id_menu
       WHERE p.waktu_pesan::date BETWEEN $1 AND $2
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
exports.getChart = async (req, res) => {
  try {
    const dari   = req.query.dari   || new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
    const sampai = req.query.sampai || new Date().toISOString().split('T')[0];

    const { rows } = await pool.query(
      `SELECT
         TO_CHAR(waktu_pesan::date, 'DD/MM') AS label,
         COUNT(*) AS total
       FROM pesanan
       WHERE waktu_pesan::date BETWEEN $1 AND $2
       GROUP BY waktu_pesan::date
       ORDER BY waktu_pesan::date ASC`,
      [dari, sampai]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('[laporanController.getChart]', err);
    return res.status(500).json({ success: false, message: 'Gagal ambil data chart.' });
  }
};

// ── GET /api/laporan/export/pdf ───────────────────────────────────
exports.exportPdf = async (req, res) => {
  try {
    const dari   = req.query.dari   || new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
    const sampai = req.query.sampai || new Date().toISOString().split('T')[0];

    const { rows } = await pool.query(
      `SELECT
         TO_CHAR(p.waktu_pesan::date, 'DD/MM/YYYY') AS tanggal,
         m.nama_menu                                  AS menu,
         SUM(dp.jumlah)                               AS terjual
       FROM detail_pesanan dp
       JOIN pesanan p  ON dp.id_pesanan = p.id_pesanan
       JOIN menu m     ON dp.id_menu    = m.id_menu
       WHERE p.waktu_pesan::date BETWEEN $1 AND $2
       GROUP BY p.waktu_pesan::date, m.id_menu, m.nama_menu
       ORDER BY p.waktu_pesan::date ASC, terjual DESC`,
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
exports.getDetailMenu = async (req, res) => {
  try {
    const dari   = req.query.dari   || new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
    const sampai = req.query.sampai || new Date().toISOString().split('T')[0];

    const { rows } = await pool.query(
      `SELECT
         TO_CHAR(p.waktu_pesan::date, 'DD/MM/YYYY') AS tanggal,
         m.nama_menu    AS menu,
         SUM(dp.jumlah)  AS terjual
       FROM detail_pesanan dp
       JOIN pesanan p ON dp.id_pesanan = p.id_pesanan
       JOIN menu m    ON dp.id_menu    = m.id_menu
       WHERE p.waktu_pesan::date BETWEEN $1 AND $2
       GROUP BY p.waktu_pesan::date, m.id_menu, m.nama_menu
       ORDER BY p.waktu_pesan::date ASC, terjual DESC`,
      [dari, sampai]
    );

    const totalTerjual = rows.reduce((s, r) => s + Number(r.terjual), 0);

    return res.status(200).json({
      success: true, dari, sampai,
      total: rows.length, totalTerjual, data: rows,
    });
  } catch (err) {
    console.error('[laporanController.getDetailMenu]', err);
    return res.status(500).json({ success: false, message: 'Gagal ambil detail menu.' });
  }
};