import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { orderAPI } from '../services/api'; // ✅ FIX #1: typo 'sevices' → 'services'

const TABS     = ["Semua Pesanan", "Menunggu", "Diproses", "Selesai"];
const PER_PAGE = 10;

// ─── Normalisasi status dari DB ke label tampilan ─────────────────
// ✅ FIX #2: mapping status backend (pending/cooking/ready) → label frontend
const normalizeStatus = (status) => {
  const map = {
    pending:  "Menunggu",
    cooking:  "Diproses",
    ready:    "Selesai",
    // sudah sesuai (tidak perlu mapping):
    Menunggu: "Menunggu",
    Diproses: "Diproses",
    Selesai:  "Selesai",
  };
  return map[status] || status;
};

// ─── Kirim sinyal ke Dashboard agar grafik langsung refresh ──────
const triggerChartRefresh = () => {
  window.dispatchEvent(new CustomEvent('pesanan-updated'));
};

const Orders = () => {
  const [pesanan,    setPesanan]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("Semua Pesanan");
  const [search,     setSearch]     = useState("");
  const [page,       setPage]       = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const response = await orderAPI.getAll();
      if (response.success) setPesanan(response.data);
    } catch (error) {
      console.error("Gagal mengambil pesanan:", error);
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const id = setInterval(() => fetchOrders(true), 10_000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchOrders(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  // ── Update status → refresh list + sinyal Dashboard ─────────────
  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await orderAPI.updateStatus(id, status);
      if (res.success) {
        fetchOrders(true);
        triggerChartRefresh();
      }
    } catch (error) {
      alert("Gagal update status: " + error.message);
    }
  };

  // ── Hapus pesanan → refresh list + sinyal Dashboard ─────────────
  const handleHapus = async (id) => {
    if (!window.confirm("Hapus pesanan ini?")) return;
    try {
      const res = await orderAPI.delete(id);
      if (res.success) {
        fetchOrders(true);
        triggerChartRefresh();
      }
    } catch (error) {
      alert("Gagal menghapus: " + error.message);
    }
  };

  // ── Filter — gunakan normalizeStatus agar 'pending' → 'Menunggu' ─
  const filtered = pesanan.filter((p) => {
    const statusNormal = normalizeStatus(p.status);
    const matchTab     = activeTab === "Semua Pesanan" || statusNormal === activeTab;
    const matchSearch  =
      (p.menu || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.meja || "").toString().includes(search);
    return matchTab && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Badge warna per status ────────────────────────────────────────
  const getStatusBadge = (status) => {
    const label = normalizeStatus(status);
    const styles = {
      Selesai:  "bg-green-100 text-green-700",
      Diproses: "bg-orange-100 text-orange-700",
      Menunggu: "bg-blue-100 text-blue-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full font-bold text-xs ${styles[label] || "bg-gray-100 text-gray-600"}`}>
        {label}
      </span>
    );
  };

  // ── Tombol aksi per status ────────────────────────────────────────
  const getAksi = (status, id) => {
    const label = normalizeStatus(status);

    if (label === "Menunggu")
      return (
        <div className="flex justify-center">
          <button
            onClick={() => handleUpdateStatus(id, "Diproses")}
            className="bg-blue-500 text-white text-[11px] rounded-full font-semibold w-20 py-1 hover:bg-blue-600 transition-colors"
          >
            Proses
          </button>
        </div>
      );

    if (label === "Diproses")
      return (
        <div className="flex justify-center">
          <button
            onClick={() => handleUpdateStatus(id, "Selesai")}
            className="bg-yellow-400 text-white text-[11px] rounded-full font-semibold w-20 py-1 hover:bg-yellow-500 transition-colors"
          >
            Selesai
          </button>
        </div>
      );

    if (label === "Selesai")
      return (
        <div className="flex justify-center">
          <button
            onClick={() => handleHapus(id)}
            className="bg-red-500 text-white text-[11px] rounded-full font-semibold w-20 py-1 hover:bg-red-600 transition-colors"
          >
            Hapus
          </button>
        </div>
      );

    return null;
  };

  // ── Hitung jumlah per tab ─────────────────────────────────────────
  const countByTab = (tab) => {
    if (tab === "Semua Pesanan") return pesanan.length;
    return pesanan.filter(p => normalizeStatus(p.status) === tab).length;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Kelola Pesanan</h1>
          <p className="text-sm font-bold text-gray-400">
            Semua pesanan pelanggan (Real-time · auto refresh 10 detik)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Tombol Refresh Manual */}
          <button
            onClick={handleManualRefresh}
            title="Refresh sekarang"
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>

          {/* Search */}
          <div className="relative" style={{ width: 280 }}>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              style={{ width: 14, height: 14 }}
            />
            <input
              type="text"
              placeholder="Cari meja atau menu..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{
                paddingLeft: 34, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
                borderRadius: 10, border: "1px solid #E5E7EB",
                background: "#fff", fontSize: 13, outline: "none",
                width: "100%", boxSizing: "border-box", color: "#374151",
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabs + counter badge */}
      <div className="flex gap-6 border-b border-gray-200 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            className={`pb-2 text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === tab
                ? "text-red-500 border-b-2 border-red-500"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === tab ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-400"
            }`}>
              {countByTab(tab)}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-gray-100 bg-white">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#E53E3E] text-white">
              <th className="py-3 px-5 text-left font-semibold">No</th>
              <th className="py-3 px-5 text-left font-semibold">Meja</th>
              <th className="py-3 px-5 text-left font-semibold">Menu Pesanan</th>
              <th className="py-3 px-5 text-left font-semibold">Waktu</th>
              <th className="py-3 px-5 text-left font-semibold">Status</th>
              <th className="py-3 px-5 text-center font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && paginated.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-gray-400 italic">
                  Memuat data pesanan...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-gray-400 italic">
                  Tidak ada pesanan ditemukan
                </td>
              </tr>
            ) : (
              paginated.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-50 hover:bg-pink-50 transition-colors"
                >
                  <td className="py-3 px-5 text-gray-500 text-xs">
                    {(page - 1) * PER_PAGE + index + 1}
                  </td>
                  <td className="py-3 px-5 text-gray-700 font-bold text-xs">{item.meja}</td>
                  <td className="py-3 px-5 text-gray-600 text-xs">{item.menu}</td>
                  <td className="py-3 px-5 text-gray-500 text-xs">{item.waktu}</td>
                  <td className="py-3 px-5 text-xs">{getStatusBadge(item.status)}</td>
                  <td className="py-3 px-5">{getAksi(item.status, item.id)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end mt-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="w-7 h-7 flex items-center justify-center text-xs text-gray-400 border border-gray-200 rounded bg-white hover:bg-gray-50"
            >‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 flex items-center justify-center text-xs rounded border transition-colors ${
                  page === p
                    ? "border-gray-300 bg-white text-gray-900 font-bold"
                    : "border-gray-200 bg-white text-gray-400 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="w-7 h-7 flex items-center justify-center text-xs text-gray-400 border border-gray-200 rounded bg-white hover:bg-gray-50"
            >›</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
