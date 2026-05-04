// ================================================================
// src/services/api.js — API Service Layer
// ================================================================
// File ini SAMA PERSIS dipakai di:
//   admin/src/services/api.js
//   appdimsum/src/services/api.js
//
// BASE_URL selalu http://localhost:3000/api
//
// PENTING — Dashboard.jsx harus diubah:
//   SEBELUM: fetch("http://localhost:5000/api/stats")
//   SESUDAH: fetch("http://localhost:3000/api/stats")
//   Atau gunakan: statsAPI.get() dari file ini
// ================================================================

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api';
export const STORAGE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000');
const SUPABASE_STORAGE_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://ydndrkxchypzaywhbywg.supabase.co') + '/storage/v1/object/public/menu-images/';

export const getImageUrl = (path) => {
  if (!path) return null;
  // Jika path mulai dengan '/', anggap local storage (backward compatibility)
  if (path.startsWith('/')) {
    return `${STORAGE_URL}${path}`;
  }
  // Jika path adalah URL lengkap, return langsung
  if (path.startsWith('http')) {
    return path;
  }
  // Selain itu anggap path di Supabase Bucket
  return `${SUPABASE_STORAGE_URL}${path}`;
};

// ── Helper fetch dengan error handling ───────────────────────────
const apiFetch = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `HTTP Error ${response.status}`);
  }
  return data;
};

// ── menuAPI ───────────────────────────────────────────────────────
// Dipakai: RestaurantMenu.jsx, OrderContext.jsx, Menu.jsx
export const menuAPI = {
  // GET /api/menus — semua menu aktif
  getAll: () =>
    apiFetch(`${BASE_URL}/menus`),

  // GET /api/menus/:id — satu menu by ID
  getById: (id) =>
    apiFetch(`${BASE_URL}/menus/${id}`),

  // POST /api/menus — tambah menu baru dengan gambar
  // formData harus FormData object (bukan JSON)
  create: (formData) =>
    fetch(`${BASE_URL}/menus`, {
      method: 'POST',
      body: formData, // JANGAN set Content-Type, biarkan browser set boundary multipart
    }).then(r => r.json()),

  // PUT /api/menus/:id — edit menu (bisa sekalian ganti gambar)
  update: (id, formData) =>
    fetch(`${BASE_URL}/menus/${id}`, {
      method: 'PUT',
      body: formData,
    }).then(r => r.json()),

  // DELETE /api/menus/:id — soft delete
  delete: (id) =>
    apiFetch(`${BASE_URL}/menus/${id}`, { method: 'DELETE' }),
};

// ── orderAPI ──────────────────────────────────────────────────────
// Dipakai: Orders.jsx, KelolaPesanan.jsx, DetailPesanan.jsx, ConfirmPage.jsx
export const orderAPI = {
  // GET /api/orders — semua pesanan
  getAll: () =>
    apiFetch(`${BASE_URL}/orders`),

  // GET /api/orders/:id — detail satu pesanan (DetailPesanan.jsx)
  getById: (id) =>
    apiFetch(`${BASE_URL}/orders/${id}`),

  // POST /api/orders — buat pesanan baru
  // data: { no_meja: number, catatan: string, items: [{id_menu, jumlah}] }
  create: (data) =>
    apiFetch(`${BASE_URL}/orders`, {
      method: 'POST',
      body:   JSON.stringify(data),
    }),

  // PATCH /api/orders/:id/status — update status pesanan
  // status: 'pending'|'Menunggu'|'cooking'|'Diproses'|'ready'|'Selesai'
  updateStatus: (id, status) =>
    apiFetch(`${BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      body:   JSON.stringify({ status }),
    }),

  // DELETE /api/orders/:id — hapus pesanan (tombol Hapus di Orders.jsx)
  delete: (id) =>
    apiFetch(`${BASE_URL}/orders/${id}`, { method: 'DELETE' }),
};

// ── statsAPI ──────────────────────────────────────────────────────
// Dipakai: Dashboard.jsx, SalesChart.jsx, VisitorChart.jsx,
//          RecentOrders.jsx, StatCards.jsx
export const statsAPI = {
  // GET /api/stats — Dashboard.jsx polling 5 detik
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

// ── laporanAPI ────────────────────────────────────────────────────
// Dipakai: LaporanMenu.jsx, LaporanPenjualan.jsx
export const laporanAPI = {
  // GET /api/laporan?dari=&sampai= — tabel laporan
  getAll: (dari, sampai) => {
    const params = new URLSearchParams();
    if (dari)   params.set('dari',   dari);
    if (sampai) params.set('sampai', sampai);
    return apiFetch(`${BASE_URL}/laporan?${params}`);
  },

  // GET /api/laporan/summary — 4 kartu statistik
  getSummary: (dari, sampai) => {
    const params = new URLSearchParams();
    if (dari)   params.set('dari',   dari);
    if (sampai) params.set('sampai', sampai);
    return apiFetch(`${BASE_URL}/laporan/summary?${params}`);
  },

  // GET /api/laporan/top-menu — menu terlaris
  getTopMenu: (dari, sampai) => {
    const params = new URLSearchParams();
    if (dari)   params.set('dari',   dari);
    if (sampai) params.set('sampai', sampai);
    return apiFetch(`${BASE_URL}/laporan/top-menu?${params}`);
  },

  // GET /api/laporan/chart — grafik pesanan per hari
  getChart: (dari, sampai) => {
    const params = new URLSearchParams();
    if (dari)   params.set('dari',   dari);
    if (sampai) params.set('sampai', sampai);
    return apiFetch(`${BASE_URL}/laporan/chart?${params}`);
  },

  // Export Excel — buka URL langsung di browser untuk download
  exportExcel: (dari, sampai) => {
    const params = new URLSearchParams();
    if (dari)   params.set('dari',   dari);
    if (sampai) params.set('sampai', sampai);
    window.open(`${BASE_URL}/laporan/export/excel?${params}`, '_blank');
  },

  // Export PDF data — frontend pakai ini untuk generate PDF
  exportPdf: (dari, sampai) => {
    const params = new URLSearchParams();
    if (dari)   params.set('dari',   dari);
    if (sampai) params.set('sampai', sampai);
    return apiFetch(`${BASE_URL}/laporan/export/pdf?${params}`);
  },
};

// ── authAPI ───────────────────────────────────────────────────────
// Dipakai: Login.jsx, Navbar.jsx, PrivateRoute.jsx
export const authAPI = {
  // POST /api/auth/login
  login: (username, password) =>
    apiFetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  // POST /api/auth/register
  register: (data) =>
    apiFetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // POST /api/auth/logout
  logout: () => {
    const token = localStorage.getItem('token');
    return apiFetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // GET /api/auth/me
  me: () => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.reject('No token found');
    return apiFetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};