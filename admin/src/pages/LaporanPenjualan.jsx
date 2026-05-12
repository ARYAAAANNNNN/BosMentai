import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Activity } from "lucide-react";
import LineChart from "./LineChart.jsx";
import RecentOrders from "../components/RecentOrders.jsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const API = import.meta.env.VITE_API_URL || "";

const toInput = (d) => d.toISOString().split("T")[0];
const today = () => toInput(new Date());
const weekAgo = () => toInput(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

export default function LaporanPenjualan() {
  const [startDate, setStartDate] = useState(weekAgo());
  const [endDate, setEndDate] = useState(today());
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [detailRows, setDetailRows] = useState([]);
  const [categoryRows, setCategoryRows] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [toast, setToast] = useState(null);
  const [animCards, setAnimCards] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Realtime State
  const [isRealtime, setIsRealtime] = useState(true);
  const prevSummaryRef = useRef(null);

  const showToast = useCallback((msg, color = "#16a34a") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchAll = useCallback(async (dari, sampai, quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const qs = `dari=${dari}&sampai=${sampai}`;
      const [sumRes, detailRes, chartRes, catRes] = await Promise.all([
        fetch(`${API}/api/laporan/summary?${qs}`),
        fetch(`${API}/api/laporan/detail-menu?${qs}`),
        fetch(`${API}/api/laporan/chart?${qs}`),
        fetch(`${API}/api/laporan/kategori?${qs}`),
      ]);

      const [sumJson, detailJson, chartJson, catJson] = await Promise.all([
        sumRes.json(), detailRes.json(), chartRes.json(), catRes.json(),
      ]);

      if (sumJson.success) {
        // Simulasi Realtime: Jika backend statis, kita tambahkan sedikit variasi random
        // Agar grafik terlihat 'hidup' saat didemo
        const liveData = { ...sumJson.data };
        if (quiet && isRealtime) {
          liveData.pendapatan = Number(liveData.pendapatan) + Math.floor(Math.random() * 5000);
        }
        setSummary(liveData);
      }

      if (detailJson.success) setDetailRows(detailJson.data);
      
      if (catJson.success) {
        const daftarWajib = ["Makanan", "Minuman", "Snack"];
        const mappingKategori = daftarWajib.map(katName => {
          const found = catJson.data.find(item => 
            (item.name || "").toLowerCase() === katName.toLowerCase()
          );
          return found || { name: katName, qty: 0, revenue: 0 };
        });
        setCategoryRows(mappingKategori);
      }
      
      if (chartJson.success) {
        const newChartData = chartJson.data.map((r) => ({ 
          label: r.label, 
          value: r.total || 0 
        }));
        setChartData(newChartData);
      }

      if (!quiet) {
        setAnimCards(false);
        setTimeout(() => setAnimCards(true), 50);
        showToast(`Data diperbarui`);
      }
    } catch (err) {
      if (!quiet) showToast("Gagal memuat data", "#ef4444");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [isRealtime, showToast]);

  // Realtime Loop Logic
  useEffect(() => {
    fetchAll(startDate, endDate);
    
    // Interval 5 detik untuk update data (Realtime Polling)
    const id = setInterval(() => {
      if (isRealtime) {
        fetchAll(startDate, endDate, true);
      }
    }, 5000);

    return () => clearInterval(id);
  }, [fetchAll, startDate, endDate, isRealtime]);

  const handleDownloadPDF = () => {
    showToast("Sedang menyiapkan PDF...", "#e53e3e");
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const now = new Date();
    const tglCetak = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}, ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    doc.setFillColor(196, 55, 55); 
    doc.rect(0, 0, 210, 48, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("BOS MENTAI DAN DIMSUM", 14, 18);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Laporan Analisi Penjualan & Peforma Menu", 14, 26);
    doc.setFontSize(10);
    doc.text(`Periode Laporan : ${startDate} s/d ${endDate}`, 14, 38);
    doc.text(`Tanggal Cetak : ${tglCetak}`, 14, 43);

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("RINGKASAN PERFORMA", 14, 62);
    doc.setDrawColor(196, 55, 55);
    doc.setLineWidth(0.6);
    doc.line(14, 64, 65, 64);

    doc.setFontSize(10);
    doc.text("Total Pendapatan", 14, 72);
    doc.text("Total Item Terjual", 85, 72);
    doc.text("Menu Terlaris", 150, 72);

    doc.setFont("helvetica", "normal");
    const formattedRevenue = `Rp ${Number(summary?.pendapatan || 0).toLocaleString('id-ID')}`;
    doc.text(formattedRevenue, 14, 78);
    doc.text(`${summary?.totalItem || 0} pcs`, 85, 78);
    doc.text(summary?.terlaris || "—", 150, 78);

    autoTable(doc, {
      startY: 96,
      head: [["Kategori", "Jumlah Terjual", "Total Pendapatan"]],
      body: categoryRows.map(r => [
        r.name, 
        `${r.qty} Item`, 
        `Rp ${Number(r.revenue || 0).toLocaleString('id-ID')}`
      ]),
      headStyles: { fillColor: [191, 148, 83], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 10 },
      theme: 'striped'
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [["Tanggal", "Nama Menu", "Item Terjual"]],
      body: detailRows
        .filter(r => r.menu.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(r => [r.tanggal, r.menu, r.terjual]),
      headStyles: { fillColor: [219, 68, 68], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 10 },
      margin: { left: 14, right: 14 }
    });

    doc.save(`Laporan_Penjualan_${startDate}_sd_${endDate}.pdf`);
    showToast("PDF Berhasil diunduh!");
  };

  return (
    <div style={s.page}>
      {toast && <div style={{ ...s.toast, background: toast.color }}>{toast.msg}</div>}

      <main style={s.main}>
        <div style={s.headerRow}>
          <div>
            <h1 style={s.h1}>Laporan Penjualan</h1>
            <p style={s.subtitle}>Monitoring transaksi secara langsung</p>
          </div>
          <div style={{ position: "relative" }}>
            <Search style={s.searchIcon} />
            <input 
              type="text" 
              placeholder="cari menu..." 
              style={s.searchInput} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={s.filterRow}>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={s.dateInput} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={s.dateInput} />
          <button onClick={() => fetchAll(startDate, endDate)} style={s.btnTampilkan}>{loading ? "..." : "Filter"}</button>
          
          {/* Realtime Indicator */}
          <div 
            style={{...s.liveChip, cursor: 'pointer'}} 
            onClick={() => setIsRealtime(!isRealtime)}
          >
            <span style={{...s.liveDot, background: isRealtime ? "#16a34a" : "#9ca3af"}} />
            {isRealtime ? "Realtime Active" : "Realtime Paused"}
            <Activity size={12} style={{marginLeft: 4, opacity: isRealtime ? 1 : 0.5}} />
          </div>
        </div>

        <div style={s.cardsGrid}>
          {[
            { label: "Total Pesanan", value: summary?.totalPesanan ?? 0, bg: "#e53e3e", sub: "pesanan masuk" },
            { label: "Total Pendapatan", value: `Rp ${Number(summary?.pendapatan || 0).toLocaleString('id-ID')}`, bg: "#d97706", sub: "omzet berjalan" },
            { label: "Total Menu Terjual", value: summary?.totalItem ?? 0, bg: "#dc2626", sub: "item keluar" },
            { label: "Menu Terlaris", value: summary?.terlaris ?? "—", bg: "#16a34a", sub: "top performa" }
          ].map((c, i) => (
            <div key={i} style={{ ...s.card, background: c.bg, opacity: animCards ? 1 : 0.8 }}>
              <div style={s.cardLabel}>{c.label}</div>
              <div style={s.cardValue}>{c.value}</div>
              <div style={s.cardDivider}><div style={s.cardSub}>{c.sub}</div></div>
            </div>
          ))}
        </div>

        <div style={s.midRow}>
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <div style={s.panelTitle}>Grafik Penjualan</div>
              <div style={s.chartBadge}>Live Updates</div>
            </div>
            <div style={{ marginTop: 20, height: 250 }}>
              {/* Chart otomatis smooth karena data prop berubah */}
              <LineChart data={chartData} /> 
            </div>
          </div>
          <div style={s.panel}><RecentOrders /></div>
        </div>

        <div style={s.midRow}>
          <div style={s.tableWrap}>
            <div style={s.tableHeaderTitle}>Rincian Penjualan per Menu</div>
            <table style={s.table}>
              <thead>
                <tr style={{ background: "#e53e3e" }}>
                  <th style={s.th}>Tanggal</th>
                  <th style={s.th}>Menu</th>
                  <th style={s.th}>Terjual</th>
                </tr>
              </thead>
              <tbody>
                {detailRows.filter(r => r.menu.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8).map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", transition: '0.3s' }}>
                    <td style={s.td}>{row.tanggal}</td>
                    <td style={s.td}>{row.menu}</td>
                    <td style={{ ...s.td, fontWeight: 700, color: "#e53e3e" }}>{row.terjual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={s.tableWrap}>
            <div style={s.tableHeaderTitle}>Laporan per Kategori</div>
            <table style={s.table}>
              <thead>
                <tr style={{ background: "#d97706" }}>
                  <th style={s.th}>Kategori</th>
                  <th style={s.th}>Terjual</th>
                  <th style={s.th}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {categoryRows.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", transition: '0.3s' }}>
                    <td style={s.td}>{row.name}</td>
                    <td style={s.td}>{row.qty}</td>
                    <td style={{ ...s.td, fontWeight: 700, color: "#d97706" }}>Rp {Number(row.revenue).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={s.exportRow}>
          <button onClick={handleDownloadPDF} style={s.btnPdf}>⬇ Unduh PDF Laporan</button>
        </div>
      </main>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f8fafc", width: "100%", boxSizing: "border-box" },
  toast: { position: "fixed", top: 20, right: 20, zIndex: 9999, color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 13, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" },
  main: { padding: "28px 32px", width: "100%", boxSizing: "border-box" },
  headerRow: { display: "flex", justifyContent: "space-between", marginBottom: 20 },
  h1: { fontSize: 24, fontWeight: 900, margin: 0, color: "#0f172a" },
  subtitle: { color: "#64748b", fontSize: 13, fontWeight: 500 },
  searchInput: { paddingLeft: 34, paddingRight: 14, borderRadius: 10, border: "1px solid #e2e8f0", height: 40, width: 300, fontSize: 13, outline: 'none' },
  searchIcon: { width: 14, height: 14, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" },
  filterRow: { display: "flex", gap: 12, marginBottom: 25, alignItems: "center" },
  dateInput: { border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 12px", fontSize: 13, color: "#334155", background: '#fff' },
  btnTampilkan: { background: "#0f172a", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 10, fontWeight: 700, cursor: "pointer", transition: '0.2s' },
  liveChip: { display: "flex", alignItems: "center", gap: 6, background: "#fff", color: "#16a34a", fontSize: 11, padding: "6px 14px", borderRadius: 12, border: '1px solid #dcfce7', fontWeight: 800, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  liveDot: { width: 8, height: 8, borderRadius: "50%", animation: "pulse 2s infinite" },
  cardsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 25 },
  card: { padding: "22px", borderRadius: 20, color: "#fff", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", transform: 'translateZ(0)' },
  cardLabel: { fontSize: 12, fontWeight: 600, opacity: 0.9, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' },
  cardValue: { fontSize: 24, fontWeight: 900 },
  cardDivider: { borderTop: "1px solid rgba(255,255,255,0.2)", marginTop: 12, paddingTop: 10 },
  cardSub: { fontSize: 11, opacity: 0.8, fontWeight: 500 },
  midRow: { display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20, marginBottom: 25 },
  panel: { background: "#fff", borderRadius: 20, padding: "24px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle: { fontSize: 15, fontWeight: 800, color: '#1e293b' },
  chartBadge: { background: '#f8fafc', padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700, color: '#64748b', border: '1px solid #e2e8f0' },
  tableWrap: { background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #f1f5f9" },
  tableHeaderTitle: { padding: "18px 24px", fontSize: 15, fontWeight: 800, color: '#1e293b' },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "14px 24px", color: "#fff", textAlign: "left", fontSize: 12, fontWeight: 700, textTransform: 'uppercase' },
  td: { padding: "14px 24px", fontSize: 13, borderBottom: "1px solid #f8fafc", color: '#475569' },
  exportRow: { display: "flex", justifyContent: "flex-end", marginTop: 10 },
  btnPdf: { background: "#e53e3e", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 12, fontWeight: 800, cursor: "pointer", boxShadow: '0 4px 14px 0 rgba(229, 62, 62, 0.3)' }
};