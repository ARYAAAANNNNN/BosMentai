'use strict';

const pool = require('../config/db');
const fs   = require('fs');

const resolveStatus = (stok) => {
  if (stok === 0)  return 'habis';
  if (stok <= 5)   return 'hampir_habis';
  if (stok <= 20)  return 'menipis';
  return 'tersedia';
};

// ── GET /api/menus ────────────────────────────────────────────────
exports.getAllMenus = async (req, res) => {
  console.log('[menuController] Calling getAllMenus. Type of pool.query:', typeof pool.query);
  try {
    const { rows } = await pool.query(
      `SELECT
         m.id_menu        AS id,
         m.nama_menu      AS nama,
         m.nama_menu,
         m.gambar         AS image,
         m.gambar,
         m.id_kategori,
         m.stok,
         m.status,
         m.total_dipesan  AS pesanan,
         m.is_active,
         k.nama_kategori  AS kategori,
         k.nama_kategori  AS category
       FROM menu m
       LEFT JOIN kategori k ON m.id_kategori = k.id_kategori
       WHERE m.is_active = true
       ORDER BY k.urutan ASC, m.nama_menu ASC`
    );
    return res.status(200).json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    console.error('[menuController.getAllMenus]', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data menu.' });
  }
};

// ── GET /api/menus/:id ────────────────────────────────────────────
exports.getMenuById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT m.*, k.nama_kategori AS kategori
       FROM menu m LEFT JOIN kategori k ON m.id_kategori = k.id_kategori
       WHERE m.id_menu = $1 AND m.is_active = true`,
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Menu tidak ditemukan.' });
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[menuController.getMenuById]', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil menu.' });
  }
};

// ── POST /api/menus ───────────────────────────────────────────────
exports.createMenu = async (req, res) => {
  const { nama_menu, id_kategori, stok } = req.body;

  const errors = [];
  if (!nama_menu || typeof nama_menu !== 'string' || !nama_menu.trim())
    errors.push('nama_menu wajib diisi.');

  const parsedKategori = parseInt(id_kategori, 10);
  if (isNaN(parsedKategori) || parsedKategori <= 0)
    errors.push('id_kategori harus berupa angka positif.');

  const parsedStok = parseInt(stok, 10);
  if (isNaN(parsedStok) || parsedStok < 0)
    errors.push('stok tidak boleh negatif.');

  if (errors.length > 0) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(422).json({ success: false, errors });
  }

  try {
    const { rows: katRows } = await pool.query(
      'SELECT id_kategori FROM kategori WHERE id_kategori = $1 LIMIT 1',
      [parsedKategori]
    );
    if (!katRows.length) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(404).json({ success: false, message: `Kategori id ${parsedKategori} tidak ditemukan.` });
    }

    const gambarPath = req.file ? `/uploads/menus/${req.file.filename}` : null;
    const status     = resolveStatus(parsedStok);

    const { rows } = await pool.query(
      `INSERT INTO menu (nama_menu, gambar, id_kategori, stok, status)
        VALUES ($1, $2, $3, $4, $5) RETURNING id_menu`,
      [nama_menu.trim(), gambarPath, parsedKategori, parsedStok, status]
    );

    return res.status(201).json({
      success:   true,
      message:   'Menu berhasil ditambahkan.',
      id_menu:   rows[0].id_menu,
      nama_menu: nama_menu.trim(),
      stok:      parsedStok,
      status,
      gambar:    gambarPath,
    });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    console.error('[menuController.createMenu]', err);
    return res.status(500).json({ success: false, message: 'Gagal menyimpan menu.' });
  }
};

// ── PUT /api/menus/:id ────────────────────────────────────────────
exports.updateMenu = async (req, res) => {
  const { nama_menu, id_kategori, stok } = req.body;
  const id = req.params.id;

  try {
    const { rows: existing } = await pool.query(
      'SELECT gambar FROM menu WHERE id_menu = $1 AND is_active = true', [id]
    );
    if (!existing.length)
      return res.status(404).json({ success: false, message: 'Menu tidak ditemukan.' });

    const parsedStok = stok !== undefined ? parseInt(stok, 10) : undefined;
    const parsedKat  = id_kategori !== undefined ? parseInt(id_kategori, 10) : undefined;
    const newStatus  = parsedStok !== undefined ? resolveStatus(parsedStok) : undefined;
    const gambarPath = req.file ? `/uploads/menus/${req.file.filename}` : undefined;

    if (gambarPath && existing[0].gambar) {
      const oldPath = require('path').join(__dirname, '..', '..', 'public', existing[0].gambar);
      fs.unlink(oldPath, () => {});
    }

    await pool.query(
      `UPDATE menu SET
         nama_menu    = COALESCE($1, nama_menu),
         gambar       = COALESCE($2, gambar),
         id_kategori  = COALESCE($3, id_kategori),
         stok         = COALESCE($4, stok),
         status       = COALESCE($5, status)
       WHERE id_menu = $6`,
      [
        nama_menu?.trim() || null,
        gambarPath || null,
        parsedKat  || null,
        parsedStok !== undefined ? parsedStok : null,
        newStatus  || null,
        id,
      ]
    );

    return res.status(200).json({ success: true, message: 'Menu berhasil diperbarui.' });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    console.error('[menuController.updateMenu]', err);
    return res.status(500).json({ success: false, message: 'Gagal update menu.' });
  }
};

// ── DELETE /api/menus/:id ─────────────────────────────────────────
exports.deleteMenu = async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE menu SET is_active = false WHERE id_menu = $1',
      [req.params.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: 'Menu tidak ditemukan.' });
    return res.status(200).json({ success: true, message: 'Menu berhasil dihapus.' });
  } catch (err) {
    console.error('[menuController.deleteMenu]', err);
    return res.status(500).json({ success: false, message: 'Gagal menghapus menu.' });
  }
};

// ── GET /api/menus/kategori ───────────────────────────────────────
exports.getKategori = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id_kategori, nama_kategori, warna_chart FROM kategori ORDER BY urutan ASC'
    );
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('[menuController.getKategori]', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil kategori.' });
  }
};