import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Bell, X } from "lucide-react";
import RestaurantMenu from "../components/RestaurantMenu.jsx";
import { useOrderContext } from "../context/OrderContext.jsx";
import RecentOrders from "../components/RecentOrders";
import SalesChart from "../components/SalesChart";
import RealtimeOrderChart from "../components/RealtimeOrderChart.jsx";
import { laporanAPI } from "../services/api";

// ─── HELPER: FORMAT RUPIAH ─────────────────────────────────────────
const formatRupiah = (angka) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(angka)
    .replace("IDR", "Rp")
    .trim();

// ─── ANIMATED COUNTER ──────────────────────────────────────────────
const AnimatedNumber = ({ value, isRupiah = false }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const target = typeof value === "number" ? value : 0;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    clearInterval(ref.current);
    ref.current = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(ref.current);
      }
      setDisplay(Math.round(current));
    }, 800 / steps);
    return () => clearInterval(ref.current);
  }, [value]);

  if (isRupiah) return <span>{formatRupiah(display)}</span>;
  return <span>{display.toLocaleString("id-ID")}</span>;
};

// ─── STAT CARD COMPONENT ───────────────────────────────────────────
const StatCard = ({ label, value, sub, bg, isRupiah }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: bg,
        color: "#fff",
        borderRadius: 22,
        padding: "24px",
        cursor: "pointer",
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: hovered ? "0 12px 28px rgba(0,0,0,0.12)" : "0 4px 12px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, marginBottom: 8, letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1, marginBottom: 10 }}>
        {isRupiah ? <AnimatedNumber value={value} isRupiah /> : typeof value === "string" ? value : <AnimatedNumber value={value} />}
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.3)", width: "100%", paddingTop: 10 }}>
        <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 500 }}>{sub}</div>
      </div>
    </div>
  );
};

const SectionCard = ({ children, style, className }) => (
  <div className={className} style={{ 
    background: "#fff", 
    borderRadius: 28, 
    padding: "24px", 
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)", 
    border: "1px solid #F1F5F9",
    ...style 
  }}>
    {children}
  </div>
);

// ─── DASHBOARD MAIN COMPONENT ──────────────────────────────────────
const Dashboard = () => {
  const { orders } = useOrderContext();
  const [searchTerm, setSearchTerm] = useState("");
  
  // State UI & Data
  const [showNotif, setShowNotif] = useState(false);
  const [notifData, setNotifData] = useState(null);
  const [summary, setSummary] = useState({ totalPesanan: 0, totalItem: 0, diproses: 0, terlaris: "—" });
  const [weeklyChartData, setWeeklyChartData] = useState([]);

  const lastOrderIdRef = useRef(null);
  const isInitialLoad = useRef(true);
  const audioRef = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"));

  // ─── FUNGSI KRITIKAL: HITUNG DATA GRAFIK DARI ORDERS ───
  const calculateStatsFromOrders = useCallback((orderList) => {
    if (!orderList) return;

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    // Inisialisasi ulang ke 0 agar tidak akumulasi data lama
    const chartMap = { Senin: 0, Selasa: 0, Rabu: 0, Kamis: 0, Jumat: 0, Sabtu: 0, Minggu: 0 };
    
    let totalItemCount = 0;
    let processingCount = 0;

    orderList.forEach(order => {
      // 1. Tentukan Hari (Gunakan field yang tepat dari backend: waktu_pesan)
      const dateSource = order.waktu_pesan || order.created_at || order.createdAt || order.tanggal;
      const d = new Date(dateSource);
      
      if (!isNaN(d.getTime())) {
        const dayName = dayNames[d.getDay()];
        if (chartMap[dayName] !== undefined) {
          chartMap[dayName] += 1;
        }
      }

      // 2. Hitung Total Item Terjual
      if (order.items && Array.isArray(order.items)) {
        totalItemCount += order.items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
      }

      // 3. Hitung Pesanan Aktif (selain 'selesai' atau 'batal')
      const status = order.status?.toLowerCase();
      if (status && status !== 'selesai' && status !== 'batal') {
        processingCount += 1;
      }
    });

    // Update State Grafik
    setWeeklyChartData([
      { label: 'Senin', value: chartMap['Senin'] },
      { label: 'Selasa', value: chartMap['Selasa'] },
      { label: 'Rabu', value: chartMap['Rabu'] },
      { label: 'Kamis', value: chartMap['Kamis'] },
      { label: 'Jumat', value: chartMap['Jumat'] },
      { label: 'Sabtu', value: chartMap['Sabtu'] },
      { label: 'Minggu', value: chartMap['Minggu'] },
    ]);

    // Update State Summary (Angka di Card)
    setSummary(prev => ({
      ...prev,
      totalPesanan: orderList.length, // PASTI SAMA DENGAN JUMLAH DATA
      totalItem: totalItemCount,
      diproses: processingCount,
    }));
  }, []);

  // Sync setiap kali 'orders' berubah
  useEffect(() => {
    calculateStatsFromOrders(orders);
  }, [orders, calculateStatsFromOrders]);

  // Ambil data tambahan (Terlaris) dari API Laporan
  const fetchLaporanLainnya = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    try {
      const res = await laporanAPI.getSummary(weekAgo, today);
      if (res.success && res.data.terlaris) {
        setSummary(prev => ({ ...prev, terlaris: res.data.terlaris }));
      }
    } catch (err) {
      console.warn("Gagal ambil menu terlaris:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchLaporanLainnya();
    const intervalId = setInterval(fetchLaporanLainnya, 30000); // Terlaris update tiap 30 detik
    return () => clearInterval(intervalId);
  }, [fetchLaporanLainnya]);

  // Logika Notifikasi
  useEffect(() => {
    if (orders && orders.length > 0) {
      const latestOrder = orders[0];
      if (isInitialLoad.current) {
        lastOrderIdRef.current = latestOrder.id;
        isInitialLoad.current = false;
        return;
      }
      if (latestOrder.id !== lastOrderIdRef.current) {
        lastOrderIdRef.current = latestOrder.id;
        setNotifData({
          meja: latestOrder.meja || latestOrder.nomor_meja || "Kasir",
          item: latestOrder.items?.reduce((sum, i) => sum + (i.qty || 0), 0) || 0,
          waktu: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })
        });
        setShowNotif(true);
        audioRef.current.play().catch(() => {});
        setTimeout(() => setShowNotif(false), 7000);
      }
    }
  }, [orders]);

  const cards = [
    { label: "Total Pesanan", value: summary.totalPesanan, sub: "Data Real-time", bg: "#4F46E5" },
    { label: "Total Menu Terjual", value: summary.totalItem, sub: "Item keluar", bg: "#F59E0B" },
    { label: "Sedang Diproses", value: summary.diproses, sub: "Antrean aktif", bg: "#EF4444" },
    { label: "Menu Terlaris", value: summary.terlaris, sub: "Paling laku", bg: "#10B981" },
  ];

  return (
    <div style={{ padding: "32px", width: "100%", background: "#F8FAFC", minHeight: "100vh", boxSizing: "border-box", position: "relative" }}>
      
      {/* NOTIFIKASI */}
      {showNotif && notifData && (
        <div className="fixed top-8 right-8 z-[9999] bg-white rounded-2xl p-5 shadow-2xl flex items-center gap-4 border-l-8 border-red-500 min-w-[350px] animate-in slide-in-from-right duration-500">
          <div className="bg-red-50 p-3 rounded-xl"><Bell size={24} className="text-red-500" /></div>
          <div className="flex-1">
            <h4 className="text-sm font-black text-gray-900 m-0">Pesanan Baru!</h4>
            <p className="text-xs text-gray-500 font-medium mt-1">Meja {notifData.meja} • {notifData.item} Item • {notifData.waktu} WIB</p>
          </div>
          <button onClick={() => setShowNotif(false)} className="bg-gray-100 p-1.5 rounded-full text-gray-400 hover:text-gray-600 transition-colors"><X size={16} /></button>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 m-0 tracking-tight">Dashboard Admin</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-sm text-slate-400 font-medium">Data tersinkronisasi dengan Pesanan ({summary.totalPesanan})</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari menu atau meja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {cards.map((c, i) => (
          <StatCard key={i} label={c.label} value={c.value} sub={c.sub} bg={c.bg} />
        ))}
      </div>

      {/* CHARTS & MENU */}
      <div className="grid grid-cols-[1fr_400px] gap-6 mb-8">
        <SectionCard>
          <RestaurantMenu searchTerm={searchTerm} />
        </SectionCard>
        <RealtimeOrderChart data={weeklyChartData} />
      </div>

      <div className="grid grid-cols-[1fr_400px] gap-6">
        <SectionCard className="p-6">
          <RecentOrders />
        </SectionCard>
        <SectionCard className="p-6">
          <SalesChart data={weeklyChartData} />
        </SectionCard>
      </div>
    </div>
  );
};

export default Dashboard;