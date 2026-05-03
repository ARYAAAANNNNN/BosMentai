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
         m.stok,
         m.status,
         m.total_dipesan  AS pesanan,
         m.is_active
       FROM menu m
       WHERE m.is_active = 1
       ORDER BY m.nama_menu ASC`
    );
    return res.status(200).json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    console.error('[menuController.getAllMenus]', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data menu.', 
      debug: err.message,
      hint: 'Cek apakah tabel "menu" sudah dibuat di Supabase.'
    });
  }
};

// ── GET /api/menus/:id ────────────────────────────────────────────
exports.getMenuById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT m.*
       FROM menu m
       WHERE m.id_menu = $1 AND m.is_active = 1`,
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
  const { nama_menu, stok } = req.body;

  const errors = [];
  if (!nama_menu || typeof nama_menu !== 'string' || !nama_menu.trim())
    errors.push('nama_menu wajib diisi.');

  const parsedStok = parseInt(stok, 10);
  if (isNaN(parsedStok) || parsedStok < 0)
    errors.push('stok tidak boleh negatif.');

  if (errors.length > 0) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(422).json({ success: false, errors });
  }

  try {
    const gambarPath = req.file ? `/uploads/menus/${req.file.filename}` : null;
    const status     = resolveStatus(parsedStok);

    const { rows } = await pool.query(
      `INSERT INTO menu (nama_menu, gambar, stok, status)
        VALUES ($1, $2, $3, $4) RETURNING id_menu`,
      [nama_menu.trim(), gambarPath, parsedStok, status]
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
  const { nama_menu, stok } = req.body;
  const id = req.params.id;

  try {
    const { rows: existing } = await pool.query(
      'SELECT gambar FROM menu WHERE id_menu = $1 AND is_active = 1', [id]
    );
    if (!existing.length)
      return res.status(404).json({ success: false, message: 'Menu tidak ditemukan.' });

    const parsedStok = stok !== undefined ? parseInt(stok, 10) : undefined;
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
         stok         = COALESCE($3, stok),
         status       = COALESCE($4, status)
       WHERE id_menu = $5`,
      [
        nama_menu?.trim() || null,
        gambarPath || null,
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
      'UPDATE menu SET is_active = 0 WHERE id_menu = $1',
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

