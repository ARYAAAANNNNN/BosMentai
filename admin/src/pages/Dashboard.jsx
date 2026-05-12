import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Bell, X } from "lucide-react";
import RestaurantMenu from "../components/RestaurantMenu.jsx";
import { useOrderContext } from "../context/OrderContext.jsx";
import RecentOrders from "../components/RecentOrders";
import SalesChart from "../components/SalesChart";
import LineChart from "./LineChart.jsx";
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

// ─── STAT CARD ─────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, bg, isRupiah }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: bg,
        color: "#fff",
        borderRadius: 18,
        padding: "20px 24px",
        cursor: "pointer",
        minHeight: 110,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.15)" : "0 2px 10px rgba(0,0,0,0.08)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.9, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.1, marginBottom: 10 }}>
        {isRupiah ? <AnimatedNumber value={value} isRupiah /> : typeof value === "string" ? value : <AnimatedNumber value={value} />}
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.4)", width: "100%", paddingTop: 8 }}>
        <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 400 }}>{sub}</div>
      </div>
    </div>
  );
};

const SectionCard = ({ children, style }) => (
  <div style={{ background: "#fff", borderRadius: 24, padding: "18px", boxShadow: "0 12px 26px rgba(15, 23, 42, 0.05)", ...style }}>
    {children}
  </div>
);

const LiveChip = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#dcfce7", color: "#16a34a", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, border: "1px solid #bbf7d0" }}>
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "inline-block", animation: "pulse 1.5s infinite" }} />
    Live
  </div>
);

// ─── DASHBOARD COMPONENT ───────────────────────────────────────────
const Dashboard = () => {
  // Gunakan refreshOrders dari context untuk menarik data terbaru secara polling
  const { orders, refreshOrders } = useOrderContext();
  const [searchTerm, setSearchTerm] = useState("");
  
  // State Notifikasi
  const [showNotif, setShowNotif] = useState(false);
  const [notifData, setNotifData] = useState(null);
  
  // Ref untuk mengontrol logika "New Order"
  const lastOrderIdRef = useRef(null);
  const isInitialLoad = useRef(true);
  const audioRef = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"));

  const [summary, setSummary] = useState({ totalPesanan: 0, totalItem: 0, diproses: 0, terlaris: "—" });
  const [chartData, setChartData] = useState([]);

  // ─── LOGIKA REALTIME NOTIFIKASI ───
  useEffect(() => {
    if (orders && orders.length > 0) {
      // Pastikan data terbaru ada di index 0 (Urutan DESC)
      const latestOrder = orders[0];

      // JIKA INI LOAD PERTAMA: Tandai ID terakhir agar pesanan lama tidak memicu popup
      if (isInitialLoad.current) {
        lastOrderIdRef.current = latestOrder.id;
        isInitialLoad.current = false;
        return;
      }

      // JIKA ADA ID BARU: Tampilkan popup dan bunyi
      if (latestOrder.id !== lastOrderIdRef.current) {
        lastOrderIdRef.current = latestOrder.id;
        
        const jam = new Date().toLocaleTimeString("id-ID", { 
          hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' 
        });
        
        setNotifData({
          meja: latestOrder.meja || latestOrder.nomor_meja,
          item: latestOrder.items?.reduce((sum, i) => sum + i.qty, 0) || 0,
          waktu: jam
        });

        setShowNotif(true);
        audioRef.current.play().catch(e => console.log("Audio play blocked by browser"));

        // Update ringkasan statistik setiap kali ada pesanan baru
        fetchAll(true);

        // Tutup popup otomatis setelah 7 detik
        const timer = setTimeout(() => setShowNotif(false), 7000);
        return () => clearTimeout(timer);
      }
    }
  }, [orders]);

  // ─── FETCH DATA STATISTIK ───
  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const fetchAll = useCallback(async (quiet = false) => {
    try {
      const [sumJson, chartJson] = await Promise.allSettled([
        laporanAPI.getSummary(weekAgo, today),
        laporanAPI.getChart(weekAgo, today),
      ]);

      if (sumJson.status === "fulfilled" && sumJson.value.success) {
        const d = sumJson.value.data;
        setSummary({
          totalPesanan: d.totalPesanan ?? 0,
          totalItem: d.totalItem ?? 0,
          diproses: d.diproses ?? 0,
          terlaris: d.terlaris || "—",
        });
      }

      if (chartJson.status === "fulfilled" && chartJson.value.success) {
        setChartData(chartJson.value.data.map((r) => ({ tanggal: r.label, pesanan: r.total })));
      }
    } catch (err) {
      if (!quiet) console.warn("Dashboard fetch error:", err.message);
    }
  }, [weekAgo, today]);

  // Pooling Interval 5-10 detik untuk menarik data baru (Realtime tanpa Websocket)
  useEffect(() => {
    fetchAll();
    
    // Sinkronisasi data context (RecentOrders dsb) setiap 8 detik
    const intervalId = setInterval(() => {
      if (refreshOrders) refreshOrders(); // Update tabel pesanan di context
      fetchAll(true); // Update grafik dan stat
    }, 8000);

    return () => clearInterval(intervalId);
  }, [fetchAll, refreshOrders]);

  const cards = [
    { label: "Total Pesanan", value: summary.totalPesanan, sub: "7 hari terakhir", bg: "#E53E3E" },
    { label: "Total Menu Terjual", value: summary.totalItem, sub: "item terjual", bg: "#D97706" },
    { label: "Sedang Diproses", value: summary.diproses, sub: "pesanan aktif saat ini", bg: "#DC2626" },
    { label: "Menu Terlaris", value: summary.terlaris, sub: "paling banyak dipesan", bg: "#15803D" },
  ];

  return (
    <div style={{ padding: "28px 32px", width: "100%", background: "#F8F9FA", minHeight: "100vh", boxSizing: "border-box", fontFamily: "'Segoe UI', sans-serif", position: "relative", overflow: "hidden" }}>

      {/* ── POP-UP NOTIFIKASI (FIXED POSITION) ── */}
      {showNotif && notifData && (
        <div style={{
          position: "fixed", top: "25px", right: "25px", zIndex: 10000,
          background: "#fff", borderRadius: "16px", padding: "18px 22px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          display: "flex", alignItems: "center", gap: "15px",
          borderLeft: "6px solid #D04040",
          minWidth: "320px",
          animation: "slideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}>
          <div style={{ background: "#FEE2E2", padding: "10px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={24} color="#D04040" />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "#1F2937" }}>Pesanan Baru Masuk!</h4>
            <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>
               Meja {notifData.meja} • {notifData.item} Item • {notifData.waktu} WIB
            </p>
          </div>
          <button 
            onClick={() => setShowNotif(false)} 
            style={{ background: "#F3F4F6", border: "none", cursor: "pointer", color: "#9CA3AF", padding: "5px", borderRadius: "50%", display: "flex" }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1A202C", margin: 0 }}>Selamat Datang, Admin!</h1>
          <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>Monitoring Real-time · Update otomatis</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LiveChip />
          <div style={{ position: "relative", width: 280 }}>
            <Search style={{ width: 14, height: 14, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input
              type="text"
              placeholder="Cari menu atau pesanan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 34, paddingRight: 14, paddingTop: 9, paddingBottom: 9, borderRadius: 10, border: "1px solid #E5E7EB", background: "#fff", fontSize: 13, outline: "none", width: "100%", color: "#374151" }}
            />
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {cards.map((c, i) => (
          <StatCard key={i} label={c.label} value={c.value} sub={c.sub} bg={c.bg} />
        ))}
      </div>

      {/* ── GRID TENGAH ── */}
      <div style={{ display: "grid", gridTemplateColumns: "55% 1fr", gap: 16, marginBottom: 16 }}>
        <SectionCard><RestaurantMenu searchTerm={searchTerm} /></SectionCard>
        <SectionCard>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1A202C", margin: 0 }}>Grafik Jumlah Pesanan</h3>
            <LiveChip />
          </div>
          <LineChart data={chartData} />
        </SectionCard>
      </div>

      {/* ── GRID BAWAH ── */}
      <div style={{ display: "grid", gridTemplateColumns: "55% 1fr", gap: 12 }}>
        <SectionCard style={{ padding: "20px" }}><RecentOrders /></SectionCard>
        <SectionCard style={{ padding: "20px" }}><SalesChart /></SectionCard>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;