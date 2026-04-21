const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;
export const STORAGE_URL = import.meta.env.VITE_API_URL;

// ── Helper dengan error handling ─────────────────────────────────
const apiFetch = async (url, options = {}) => {
  let res;
  try {
    res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
  } catch (networkErr) {
    // Server mati / CORS / URL salah
    throw new Error(`Tidak dapat terhubung ke server: ${networkErr.message}`);
  }

  // Cek apakah response bertipe JSON sebelum di-parse
  const contentType = res.headers.get('Content-Type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      `Server mengembalikan bukan JSON (HTTP ${res.status}). ` +
      `Pastikan VITE_API_URL di file .env sudah benar dan server berjalan.`
    );
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
};

// ================================================================
// menuAPI — CRUD Menu
// Admin  : tambah/edit/hapus menu
// AppUser: ambil daftar menu (ganti menuData.js)
// ================================================================
export const menuAPI = {
  // GET /api/menus — admin semua menu
  // query: { kategori, status, search }
  getAll: (query = {}) => {
    const params = new URLSearchParams(query);
    return apiFetch(`${BASE_URL}/menus?${params}`);
  },

  // GET /api/menus/user — appdimsum MenuPage.jsx (GANTI menuData.js)
  // Response: { data: [{id, name, category, image, price, stok}], categories }
  // query: { category: 'Dimsum' } (opsional, default Semua)
  getForUser: (category = null) => {
    const params = new URLSearchParams();
    if (category && category !== 'Semua') params.set('category', category);
    return apiFetch(`${BASE_URL}/menus/user?${params}`);
  },

  // GET /api/menus/kategori — daftar kategori untuk dropdown & tab filter
  getKategori: () =>
    apiFetch(`${BASE_URL}/menus/kategori`),

  // GET /api/menus/:id
  getById: (id) =>
    apiFetch(`${BASE_URL}/menus/${id}`),

  // POST /api/menus — tambah menu baru + upload gambar
  // formData: FormData object { nama_menu, id_kategori, stok, harga, deskripsi, gambar }
  create: (formData) =>
    fetch(`${BASE_URL}/menus`, { method: 'POST', body: formData }).then(r => r.json()),

  // PUT /api/menus/:id — edit menu (hanya field yang dikirim)
  // formData: FormData object (bisa tanpa gambar jika tidak ganti foto)
  update: (id, formData) =>
    fetch(`${BASE_URL}/menus/${id}`, { method: 'PUT', body: formData }).then(r => r.json()),

  // DELETE /api/menus/:id — soft delete
  delete: (id) =>
    apiFetch(`${BASE_URL}/menus/${id}`, { method: 'DELETE' }),

  // PATCH /api/menus/:id/stok — update stok manual
  // body: { stok: 50 }  ATAU  { delta: -2 }
  updateStok: (id, body) =>
    apiFetch(`${BASE_URL}/menus/${id}/stok`, {
      method: 'PATCH',
      body:   JSON.stringify(body),
    }),
};

// ================================================================
// orderAPI — Manajemen Pesanan
// ================================================================
export const orderAPI = {
  // GET /api/orders — admin list pesanan
  // query: { status, search, meja }
  getAll: (query = {}) => {
    const params = new URLSearchParams(query);
    return apiFetch(`${BASE_URL}/orders?${params}`);
  },

  // GET /api/orders/kitchen — KitchenPage (pending/cooking/ready)
  getKitchen: () =>
    apiFetch(`${BASE_URL}/orders/kitchen`),

  // GET /api/orders/:id — DetailPesanan.jsx
  getById: (id) =>
    apiFetch(`${BASE_URL}/orders/${id}`),

  // POST /api/orders — buat pesanan baru (ConfirmPage.jsx & MenuPage.jsx)
  // body: { no_meja: 12, catatan: "...", items: [{id_menu: 1, jumlah: 2}] }
  create: (data) =>
    apiFetch(`${BASE_URL}/orders`, {
      method: 'POST',
      body:   JSON.stringify(data),
    }),

  // PATCH /api/orders/:id/status — update status
  // status: 'pending'|'Menunggu'|'cooking'|'Diproses'|'ready'|'Selesai'
  updateStatus: (id, status) =>
    apiFetch(`${BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      body:   JSON.stringify({ status }),
    }),

  // DELETE /api/orders/:id — hapus pesanan
  delete: (id) =>
    apiFetch(`${BASE_URL}/orders/${id}`, { method: 'DELETE' }),
};

// ================================================================
// statsAPI — Data Dashboard
// ================================================================
export const statsAPI = {
  // GET /api/stats — Dashboard.jsx (polling 5 detik)
  // Response: { totalPesananHariIni, pesananDariKemarin, totalMenu,
  //             totalPengunjung, pengunjungHariIni, pengunjungMingguIni, pendapatanHariIni }
  get: () =>
    apiFetch(`${BASE_URL}/stats`),

  // GET /api/stats/sales-chart — SalesChart.jsx donut chart
  getSalesChart: () =>
    apiFetch(`${BASE_URL}/stats/sales-chart`),

  // GET /api/stats/visitor-chart — VisitorChart.jsx line chart
  getVisitorChart: () =>
    apiFetch(`${BASE_URL}/stats/visitor-chart`),

  // GET /api/stats/recent-orders — RecentOrders.jsx 5 terbaru
  getRecentOrders: () =>
    apiFetch(`${BASE_URL}/stats/recent-orders`),

  // GET /api/stats/stat-cards — StatCards.jsx 4 kartu KPI
  getStatCards: () =>
    apiFetch(`${BASE_URL}/stats/stat-cards`),
};

// ================================================================
// laporanAPI — Laporan Penjualan
// ================================================================
export const laporanAPI = {
  // GET /api/laporan?dari=&sampai= — tabel laporan
  getAll: (dari, sampai) => {
    const p = new URLSearchParams();
    if (dari)   p.set('dari',   dari);
    if (sampai) p.set('sampai', sampai);
    return apiFetch(`${BASE_URL}/laporan?${p}`);
  },

  // GET /api/laporan/summary — 4 kartu statistik LaporanMenu.jsx
  getSummary: (dari, sampai) => {
    const p = new URLSearchParams();
    if (dari)   p.set('dari',   dari);
    if (sampai) p.set('sampai', sampai);
    return apiFetch(`${BASE_URL}/laporan/summary?${p}`);
  },

  // GET /api/laporan/top-menu — menu terlaris
  getTopMenu: (dari, sampai) => {
    const p = new URLSearchParams();
    if (dari)   p.set('dari',   dari);
    if (sampai) p.set('sampai', sampai);
    return apiFetch(`${BASE_URL}/laporan/top-menu?${p}`);
  },

  // GET /api/laporan/chart — grafik pesanan per hari
  getChart: (dari, sampai) => {
    const p = new URLSearchParams();
    if (dari)   p.set('dari',   dari);
    if (sampai) p.set('sampai', sampai);
    return apiFetch(`${BASE_URL}/laporan/chart?${p}`);
  },

  // Export Excel → buka tab baru untuk download CSV
  exportExcel: (dari, sampai) => {
    const p = new URLSearchParams();
    if (dari)   p.set('dari',   dari);
    if (sampai) p.set('sampai', sampai);
    window.open(`${BASE_URL}/laporan/export/excel?${p}`, '_blank');
  },

  // Export PDF → data JSON untuk generate PDF di frontend
  exportPdf: (dari, sampai) => {
    const p = new URLSearchParams();
    if (dari)   p.set('dari',   dari);
    if (sampai) p.set('sampai', sampai);
    return apiFetch(`${BASE_URL}/laporan/export/pdf?${p}`);
  },
};