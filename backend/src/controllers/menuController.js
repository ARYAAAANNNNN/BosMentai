const pool = require('../config/db');
const supabase = require('../config/supabase');
const fs = require('fs');

const resolveStatus = (stok) => {
  if (stok === 0)  return 'habis';
  if (stok <= 5)   return 'hampir_habis';
  if (stok <= 20)  return 'menipis';
  return 'tersedia';
};

// Helper untuk upload ke Supabase Storage
const uploadToSupabase = async (file) => {
  if (!file) return null;
  
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const fileData = fs.readFileSync(file.path);
  
  const { data, error } = await supabase.storage
    .from('menus')
    .upload(filePath, fileData, {
      contentType: file.mimetype,
      upsert: true
    });

  if (error) {
    console.error('Error uploading to Supabase:', error);
    throw new Error('Gagal unggah gambar ke Supabase Storage: ' + (error.message || 'Error tidak diketahui'));
  }

  // Hapus file sementara dari server
  fs.unlink(file.path, () => {});
  
  return data.path; // Mengembalikan path di bucket
};

// Helper untuk hapus dari Supabase Storage
const deleteFromSupabase = async (path) => {
  if (!path) return;
  const { error } = await supabase.storage
    .from('menus')
    .remove([path]);
  
  if (error) {
    console.error('Error deleting from Supabase:', error);
  }
};

// ── GET /api/menus ────────────────────────────────────────────────
exports.getAllMenus = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         m.id_menu        AS id,
         m.nama_menu      AS nama,
         m.nama_menu,
         m.gambar         AS image,
         m.gambar,
         m.stok,
         m.harga,
         m.status,
         m.id_kategori,
         k.nama_kategori  AS category,
         m.total_dipesan  AS pesanan,
         m.is_active
       FROM menu m
       LEFT JOIN kategori k ON m.id_kategori = k.id_kategori
       WHERE m.is_active = 1
       ORDER BY k.nama_kategori ASC, m.nama_menu ASC`
    );
    return res.status(200).json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    console.error('[menuController.getAllMenus]', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data menu.', 
      debug: err.message
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
  const { nama_menu, stok, id_kategori, harga } = req.body;

  console.log('[menuController.createMenu] Body:', req.body);
  console.log('[menuController.createMenu] File:', req.file ? req.file.originalname : 'No file');

  const errors = [];
  if (!nama_menu || typeof nama_menu !== 'string' || !nama_menu.trim())
    errors.push('nama_menu wajib diisi.');

  const parsedStok = (stok === undefined || stok === '') ? 0 : parseInt(stok, 10);
  if (isNaN(parsedStok) || parsedStok < 0)
    errors.push('stok tidak boleh negatif.');

  const parsedHarga = (harga === undefined || harga === '') ? 0 : parseFloat(harga);
  if (isNaN(parsedHarga) || parsedHarga < 0)
    errors.push('harga tidak valid.');

  if (errors.length > 0) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(422).json({ 
      success: false, 
      message: errors.join(' '), 
      errors 
    });
  }

  try {
    let gambarPath = null;
    if (req.file) {
      console.log('[menuController.createMenu] Uploading to Supabase...');
      gambarPath = await uploadToSupabase(req.file);
      console.log('[menuController.createMenu] Upload success:', gambarPath);
    }

    const status        = resolveStatus(parsedStok);
    const finalKategori = (id_kategori && id_kategori !== '') ? parseInt(id_kategori, 10) : 1;

    const { rows } = await pool.query(
      `INSERT INTO menu (nama_menu, gambar, stok, status, id_kategori, harga)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_menu`,
      [nama_menu.trim(), gambarPath, parsedStok, status, finalKategori, parsedHarga]
    );

    return res.status(201).json({
      success:   true,
      message:   'Menu berhasil ditambahkan.',
      id_menu:   rows[0].id_menu,
      nama_menu: nama_menu.trim(),
      stok:      parsedStok,
      harga:     parsedHarga,
      status,
      gambar:    gambarPath,
    });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    console.error('[menuController.createMenu] Fatal Error:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal menyimpan menu: ' + err.message, 
      debug: err.message 
    });
  }
};

// ── PUT /api/menus/:id ────────────────────────────────────────────
exports.updateMenu = async (req, res) => {
  const { nama_menu, stok, id_kategori, harga } = req.body;
  const id = req.params.id;

  console.log(`[menuController.updateMenu] ID: ${id}, Body:`, req.body);

  try {
    const { rows: existing } = await pool.query(
      'SELECT gambar FROM menu WHERE id_menu = $1 AND is_active = 1', [id]
    );
    if (!existing.length)
      return res.status(404).json({ success: false, message: 'Menu tidak ditemukan.' });

    const parsedStok  = (stok !== undefined && stok !== '') ? parseInt(stok, 10) : (stok === '' ? 0 : undefined);
    const parsedHarga = (harga !== undefined && harga !== '') ? parseFloat(harga) : (harga === '' ? 0 : undefined);
    const newStatus   = parsedStok !== undefined ? resolveStatus(parsedStok) : undefined;
    
    let gambarPath = undefined;
    if (req.file) {
      console.log('[menuController.updateMenu] Uploading new image...');
      gambarPath = await uploadToSupabase(req.file);
      console.log('[menuController.updateMenu] New image success:', gambarPath);
      // Hapus gambar lama dari Supabase
      if (existing[0].gambar) {
        await deleteFromSupabase(existing[0].gambar);
      }
    }

    await pool.query(
      `UPDATE menu SET
         nama_menu    = COALESCE($1, nama_menu),
         gambar       = COALESCE($2, gambar),
         stok         = COALESCE($3, stok),
         status       = COALESCE($4, status),
         id_kategori  = COALESCE($5, id_kategori),
         harga        = COALESCE($6, harga)
       WHERE id_menu = $7`,
      [
        nama_menu?.trim() || null,
        gambarPath || null,
        parsedStok !== undefined ? parsedStok : null,
        newStatus  || null,
        id_kategori || null,
        parsedHarga !== undefined ? parsedHarga : null,
        id,
      ]
    );

    return res.status(200).json({ success: true, message: 'Menu berhasil diperbarui.' });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    console.error('[menuController.updateMenu] Fatal Error:', err);
    return res.status(500).json({ success: false, message: 'Gagal update menu: ' + err.message, debug: err.message });
  }
};

// ── DELETE /api/menus/:id ─────────────────────────────────────────
exports.deleteMenu = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT gambar FROM menu WHERE id_menu = $1', [req.params.id]);
    
    const result = await pool.query(
      'UPDATE menu SET is_active = 0 WHERE id_menu = $1',
      [req.params.id]
    );
    
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, message: 'Menu tidak ditemukan.' });

    // Optional: Hapus gambar dari Supabase saat hapus menu (atau biarkan jika hanya soft delete)
    // if (rows[0]?.gambar) await deleteFromSupabase(rows[0].gambar);

    return res.status(200).json({ success: true, message: 'Menu berhasil dihapus.' });
  } catch (err) {
    console.error('[menuController.deleteMenu]', err);
    return res.status(500).json({ success: false, message: 'Gagal menghapus menu.' });
  }
};

