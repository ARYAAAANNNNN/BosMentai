import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Bell, X } from "lucide-react";
import RestaurantMenu from "../components/RestaurantMenu.jsx";
import { useOrderContext } from "../context/OrderContext.jsx";
import RecentOrders from "../components/RecentOrders";
import SalesChart from "../components/SalesChart";
import RealtimeOrderChart from "../components/RealtimeOrderChart.jsx";
import { laporanAPI } from "../services/api";

const formatRupiah = (angka) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka).replace("IDR", "Rp");

const Dashboard = () => {
  const { orders } = useOrderContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [notifData, setNotifData] = useState(null);
  const [summary, setSummary] = useState({ totalPesanan: 0, totalItem: 0, diproses: 0, terlaris: "—" });
  const [weeklyChartData, setWeeklyChartData] = useState([]);

  const lastOrderIdRef = useRef(null);
  const isInitialLoad = useRef(true);
  const audioRef = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"));

  // SINKRONISASI GRAFIK DENGAN DATA PESANAN ASLI (HITUNG MANUAL)
  const syncData = useCallback((orderList) => {
    if (!orderList) return;
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const chartMap = { Senin: 0, Selasa: 0, Rabu: 0, Kamis: 0, Jumat: 0, Sabtu: 0, Minggu: 0 };
    let itemsCount = 0;
    let procCount = 0;

    orderList.forEach(order => {
      // Grafik per hari
      const d = new Date(order.waktu_pesan || order.created_at || Date.now());
      const dayName = dayNames[d.getDay()];
      if (chartMap[dayName] !== undefined) chartMap[dayName] += 1;

      // Hitung Item
      if (order.items) itemsCount += order.items.reduce((s, i) => s + (Number(i.qty) || 0), 0);
      
      // Hitung Status
      const st = order.status_pesanan?.toLowerCase() || order.status?.toLowerCase();
      if (st && !['selesai', 'batal'].includes(st)) procCount += 1;
    });

    setWeeklyChartData(Object.keys(chartMap).map(day => ({ label: day, value: chartMap[day] })));
    setSummary(prev => ({ ...prev, totalPesanan: orderList.length, totalItem: itemsCount, diproses: procCount }));
  }, []);

  useEffect(() => { syncData(orders); }, [orders, syncData]);

  // Ambil menu terlaris dari API
  useEffect(() => {
    const fetchTerlaris = async () => {
      try {
        const res = await laporanAPI.getSummary();
        if (res.success) setSummary(prev => ({ ...prev, terlaris: res.data.terlaris }));
      } catch (e) { console.error("API Summary Error"); }
    };
    fetchTerlaris();
  }, []);

  // Notifikasi Order Baru
  useEffect(() => {
    if (orders?.length > 0) {
      const latest = orders[0];
      if (isInitialLoad.current) { lastOrderIdRef.current = latest.id_pesanan; isInitialLoad.current = false; return; }
      if (latest.id_pesanan !== lastOrderIdRef.current) {
        lastOrderIdRef.current = latest.id_pesanan;
        setNotifData({ meja: latest.nomor_meja || "Ksr", item: latest.items?.length || 0 });
        setShowNotif(true);
        audioRef.current.play().catch(() => {});
        setTimeout(() => setShowNotif(false), 5000);
      }
    }
  }, [orders]);

  return (
    <div style={{ padding: "32px", background: "#F8FAFC", minHeight: "100vh" }}>
      {showNotif && (
        <div className="fixed top-5 right-5 bg-white p-4 shadow-xl rounded-xl border-l-4 border-red-500 z-[9999] flex gap-3 items-center">
          <Bell className="text-red-500" />
          <div><p className="font-bold text-sm">Pesanan Baru!</p><p className="text-xs">Meja {notifData?.meja} • {notifData?.item} Item</p></div>
          <X onClick={() => setShowNotif(false)} size={14} className="cursor-pointer" />
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-slate-900">Dashboard Admin <span className="text-sm font-medium text-slate-400">({summary.totalPesanan} Pesanan)</span></h1>
        <input type="text" placeholder="Cari..." className="px-4 py-2 rounded-lg border border-slate-200" onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { l: "Total Pesanan", v: summary.totalPesanan, b: "#4F46E5" },
          { l: "Total Terjual", v: summary.totalItem, b: "#F59E0B" },
          { l: "Diproses", v: summary.diproses, b: "#EF4444" },
          { l: "Terlaris", v: summary.terlaris, b: "#10B981" }
        ].map((c, i) => (
          <div key={i} style={{ background: c.b, color: '#fff', padding: '20px', borderRadius: '15px' }}>
            <p className="text-xs opacity-80">{c.l}</p>
            <p className="text-2xl font-bold">{c.v}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_350px] gap-6">
        <RestaurantMenu searchTerm={searchTerm} />
        <div className="flex flex-col gap-6">
           <RealtimeOrderChart data={weeklyChartData} />
           <SalesChart data={weeklyChartData} />
           <RecentOrders />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;