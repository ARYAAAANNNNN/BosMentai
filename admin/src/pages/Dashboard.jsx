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

// ─── ANIMATED COUNTER (Efek Angka Berjalan) ────────────────────────
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

// ─── CONTAINER CARD ───────────────────────────────────────────────
const SectionCard = ({ children, style }) => (
  <div style={{ 
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
  const { orders, refreshOrders } = useOrderContext();
  const [searchTerm, setSearchTerm] = useState("");
  
  // State UI
  const [showNotif, setShowNotif] = useState(false);
  const [notifData, setNotifData] = useState(null);
  const [summary, setSummary] = useState({ totalPesanan: 0, totalItem: 0, diproses: 0, terlaris: "—" });

  const lastOrderIdRef = useRef(null);
  const isInitialLoad = useRef(true);
  const audioRef = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"));

  // ─── FETCH DATA STATISTIK ───
  const fetchStats = useCallback(async (quiet = false) => {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    try {
      const res = await laporanAPI.getSummary(weekAgo, today);
      if (res.success) {
        setSummary({
          totalPesanan: res.data.totalPesanan ?? 0,
          totalItem: res.data.totalItem ?? 0,
          diproses: res.data.diproses ?? 0,
          terlaris: res.data.terlaris || "—",
        });
      }
    } catch (err) {
      if (!quiet) console.warn("Gagal mengambil summary:", err.message);
    }
  }, []);

  // ─── LOGIKA REALTIME NOTIFIKASI & POLLING ───
  useEffect(() => {
    fetchStats();
    const intervalId = setInterval(() => {
      if (refreshOrders) refreshOrders();
      fetchStats(true);
    }, 8000);
    return () => clearInterval(intervalId);
  }, [fetchStats, refreshOrders]);

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
        const jam = new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
        
        setNotifData({
          meja: latestOrder.meja || latestOrder.nomor_meja,
          item: latestOrder.items?.reduce((sum, i) => sum + i.qty, 0) || 0,
          waktu: jam
        });

        setShowNotif(true);
        audioRef.current.play().catch(() => {});
        fetchStats(true);
        setTimeout(() => setShowNotif(false), 7000);
      }
    }
  }, [orders, fetchStats]);

  const cards = [
    { label: "Total Pesanan", value: summary.totalPesanan, sub: "7 hari terakhir", bg: "#4F46E5" },
    { label: "Total Menu Terjual", value: summary.totalItem, sub: "item terjual", bg: "#F59E0B" },
    { label: "Sedang Diproses", value: summary.diproses, sub: "pesanan aktif", bg: "#EF4444" },
    { label: "Menu Terlaris", value: summary.terlaris, sub: "paling disukai", bg: "#10B981" },
  ];

  return (
    <div style={{ padding: "32px", width: "100%", background: "#F8FAFC", minHeight: "100vh", boxSizing: "border-box", position: "relative" }}>

      {/* ── POP-UP NOTIFIKASI ── */}
      {showNotif && notifData && (
        <div className="fixed top-8 right-8 z-[9999] bg-white rounded-2xl p-5 shadow-2xl flex items-center gap-4 border-l-8 border-red-500 min-w-[350px] animate-in slide-in-from-right duration-500">
          <div className="bg-red-50 p-3 rounded-xl"><Bell size={24} className="text-red-500" /></div>
          <div className="flex-1">
            <h4 className="text-sm font-black text-gray-900 m-0">Pesanan Baru Masuk!</h4>
            <p className="text-xs text-gray-500 font-medium mt-1">Meja {notifData.meja} • {notifData.item} Item • {notifData.waktu} WIB</p>
          </div>
          <button onClick={() => setShowNotif(false)} className="bg-gray-100 p-1.5 rounded-full text-gray-400 hover:text-gray-600 transition-colors"><X size={16} /></button>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 m-0 tracking-tight">Dashboard Admin</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Monitoring aktivitas restoran secara realtime</p>
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

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {cards.map((c, i) => (
          <StatCard key={i} label={c.label} value={c.value} sub={c.sub} bg={c.bg} />
        ))}
      </div>

      {/* ── GRID TENGAH (UTAMA) ── */}
      <div className="grid grid-cols-[1fr_400px] gap-6 mb-8">
        {/* Restaurant Menu List */}
        <SectionCard>
          <RestaurantMenu searchTerm={searchTerm} />
        </SectionCard>

        {/* Realtime Vertical Bar Chart */}
        <RealtimeOrderChart />
      </div>

      {/* ── GRID BAWAH ── */}
      <div className="grid grid-cols-[1fr_400px] gap-6">
        <SectionCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-900">Pesanan Terbaru</h3>
          </div>
          <RecentOrders />
        </SectionCard>
        
        <SectionCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-900">Performa Penjualan</h3>
          </div>
          <SalesChart />
        </SectionCard>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .animate-pulse-slow { animation: pulse 2s infinite; }
      `}</style>
    </div>
  );
};

export default Dashboard;