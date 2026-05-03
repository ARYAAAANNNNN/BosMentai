'use strict';

const pool = require('../config/db');

// ── GET /api/stats ────────────────────────────────────────────────
exports.getStats = async (_req, res) => {
  try {
    const flatRate = parseInt(process.env.FLAT_RATE) || 75000;

    const [
      pesananHariIni,
      pesananKemarin,
      totalMenu,
      pengunjungTotal,
      pengunjungHariIni,
      pengunjungMinggu,
      pendapatan,
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM pesanan WHERE waktu_pesan::date = CURRENT_DATE`),
      pool.query(`SELECT COUNT(*) AS total FROM pesanan WHERE waktu_pesan::date = CURRENT_DATE - INTERVAL '1 day'`),
      pool.query(`SELECT COUNT(*) AS total FROM menu WHERE is_active = true AND status != 'habis'`),
      pool.query(`SELECT COUNT(*) AS total FROM visitor_log`),
      pool.query(`SELECT COUNT(*) AS total FROM visitor_log WHERE tanggal = CURRENT_DATE`),
      pool.query(`SELECT COUNT(*) AS total FROM visitor_log WHERE DATE_TRUNC('week', tanggal) = DATE_TRUNC('week', CURRENT_DATE)`),
      pool.query(`SELECT COUNT(*) AS total FROM pesanan WHERE waktu_pesan::date = CURRENT_DATE AND status_pesanan = 'Selesai'`),
    ]);

    const totalHariIni = parseInt(pesananHariIni.rows[0].total);
    const totalKemarin = parseInt(pesananKemarin.rows[0].total);

    return res.status(200).json({
      success: true,
      data: {
        totalPesananHariIni: totalHariIni,
        pesananDariKemarin:  totalHariIni - totalKemarin,
        totalMenu:           parseInt(totalMenu.rows[0].total),
        totalPengunjung:     parseInt(pengunjungTotal.rows[0].total),
        pengunjungHariIni:   parseInt(pengunjungHariIni.rows[0].total),
        pengunjungMingguIni: parseInt(pengunjungMinggu.rows[0].total),
        pendapatanHariIni:   parseInt(pendapatan.rows[0].total) * flatRate,
      },
    });
  } catch (err) {
    console.error('[statsController.getStats]', err);
    return res.status(200).json({
      success: true,
      data: {
        totalPesananHariIni: 0, pesananDariKemarin: 0,
        totalMenu: 0, totalPengunjung: 0,
        pengunjungHariIni: 0, pengunjungMingguIni: 0, pendapatanHariIni: 0,
      },
    });
  }
};

// ── GET /api/stats/sales-chart ────────────────────────────────────
exports.getSalesChart = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         m.nama_menu AS name,
         '#B34949' AS color,
         SUM(dp.jumlah) AS total
       FROM detail_pesanan dp
       JOIN menu m ON dp.id_menu = m.id_menu
       GROUP BY m.id_menu, m.nama_menu
       ORDER BY total DESC
       LIMIT 5`
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
exports.getVisitorChart = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         TO_CHAR(tanggal, 'FMDD Mon') AS date,
         COUNT(*)                      AS visitors
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
exports.getRecentOrders = async (_req, res) => {
  try {
    const colors = ['bg-red-100','bg-orange-100','bg-yellow-100','bg-teal-100','bg-purple-100'];
    const { rows } = await pool.query(
      `SELECT
         p.id_pesanan AS id,
         CONCAT('Meja ', p.no_meja) AS table_name,
         MIN(m.nama_menu)           AS item,
         TO_CHAR(p.waktu_pesan, 'HH24:MI') AS time,
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
exports.getStatCards = async (_req, res) => {
  try {
    const flatRate = parseInt(process.env.FLAT_RATE) || 75000;
    const [bulanIni, bulanLalu, pelanggan, pendapatan] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS total FROM pesanan
         WHERE EXTRACT(YEAR FROM waktu_pesan) = EXTRACT(YEAR FROM CURRENT_DATE)
           AND EXTRACT(MONTH FROM waktu_pesan) = EXTRACT(MONTH FROM CURRENT_DATE)`
      ),
      pool.query(
        `SELECT COUNT(*) AS total FROM pesanan
         WHERE waktu_pesan >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
           AND waktu_pesan  < DATE_TRUNC('month', CURRENT_DATE)`
      ),
      pool.query(
        `SELECT COUNT(DISTINCT no_meja) AS total FROM pesanan
         WHERE EXTRACT(YEAR FROM waktu_pesan) = EXTRACT(YEAR FROM CURRENT_DATE)
           AND EXTRACT(MONTH FROM waktu_pesan) = EXTRACT(MONTH FROM CURRENT_DATE)`
      ),
      pool.query(
        `SELECT COUNT(*) AS total FROM pesanan
         WHERE EXTRACT(YEAR FROM waktu_pesan) = EXTRACT(YEAR FROM CURRENT_DATE)
           AND EXTRACT(MONTH FROM waktu_pesan) = EXTRACT(MONTH FROM CURRENT_DATE)
           AND status_pesanan = 'Selesai'`
      ),
    ]);

    const totalBulanIni  = parseInt(bulanIni.rows[0].total);
    const totalBulanLalu = parseInt(bulanLalu.rows[0].total);
    const pertumbuhan    = totalBulanLalu > 0
      ? Math.round((totalBulanIni - totalBulanLalu) / totalBulanLalu * 100 * 100) / 100
      : null;

    return res.status(200).json({
      success: true,
      data: {
        total_pesanan:   totalBulanIni,
        pelanggan:       parseInt(pelanggan.rows[0].total),
        pendapatan:      parseInt(pendapatan.rows[0].total) * flatRate,
        pertumbuhan_pct: pertumbuhan,
      },
    });
  } catch (err) {
    console.error('[statsController.getStatCards]', err);
    return res.status(500).json({ success: false, message: 'Gagal ambil stat cards.' });
  }
};