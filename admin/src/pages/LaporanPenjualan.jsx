import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import LineChart from "./LineChart.jsx";
import RecentOrders from "../components/RecentOrders.jsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const API = import.meta.env.VITE_API_URL || "";

// ── helpers ───────────────────────────────────────────────────────
const toInput = (d) => d.toISOString().split("T")[0];
const today   = () => toInput(new Date());
const weekAgo = () => toInput(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

export default function LaporanPenjualan() {
  // --- STATE ---
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

  // --- UI LOGIC ---
  const showToast = (msg, color = "#16a34a") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

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

      if (sumJson.success) setSummary(sumJson.data);
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
        setChartData(chartJson.data.map((r) => ({ label: r.label, value: r.total || 0 })));
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
  }, []);

  useEffect(() => {
    fetchAll(startDate, endDate);
    const id = setInterval(() => fetchAll(startDate, endDate, true), 30000);
    return () => clearInterval(id);
  }, [fetchAll, startDate, endDate]);

  const applyFilter = () => {
    if (!startDate || !endDate || startDate > endDate) {
      showToast("Rentang tanggal tidak valid!", "#ef4444");
      return;
    }
    fetchAll(startDate, endDate);
  };

  // ── FUNGSI EXPORT PDF (UI Gambar image_8ed35a.png + Data Laporan) ──
  const handleDownloadPDF = () => {
    showToast("Sedang menyiapkan PDF...", "#e53e3e");
    
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const now = new Date();
    const tglCetak = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}, ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    // 1. HEADER (Background Merah Full)
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

    // 2. RINGKASAN PERFORMA
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("RINGKASAN PERFORMA", 14, 62);
    
    // Garis Bawah Merah
    doc.setDrawColor(196, 55, 55);
    doc.setLineWidth(0.6);
    doc.line(14, 64, 65, 64);

    // Grid Informasi (Data dari State summary)
    doc.setFontSize(10);
    doc.text("Total Pendapatan", 14, 72);
    doc.text("Total Item Terjual", 85, 72);
    doc.text("Menu Terlaris", 150, 72);

    doc.setFont("helvetica", "normal");
    const formattedRevenue = `Rp ${Number(summary?.pendapatan || 0).toLocaleString('id-ID')}`;
    doc.text(formattedRevenue, 14, 78);
    doc.text(`${summary?.totalItem || 0} pcs`, 85, 78);
    doc.text(summary?.terlaris || "—", 150, 78);

    // 3. TABEL PER KATEGORI (Warna Cokelat Emas)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("LAPORAN PER KATEGORI", 14, 92);

    autoTable(doc, {
      startY: 96,
      head: [["Kategori", "Jumlah Terjual", "Total Pendapatan"]],
      body: categoryRows.map(r => [
        r.name, 
        `${r.qty} Item`, 
        `Rp ${Number(r.revenue || 0).toLocaleString('id-ID')}`
      ]),
      headStyles: { fillColor: [191, 148, 83], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 10 },
      bodyStyles: { fontSize: 9, textColor: [60, 60, 60] },
      columnStyles: {
        2: { textColor: [191, 148, 83], fontStyle: "bold" } 
      },
      margin: { left: 14, right: 14 },
      theme: 'striped'
    });

    // 4. TABEL RINCIAN PER MENU (Warna Merah)
    doc.setFont("helvetica", "bold");
    doc.text("RINCIAN PENJUALAN PER MENU", 14, doc.lastAutoTable.finalY + 12);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [["Tanggal", "Nama Menu", "Item Terjual"]],
      body: detailRows
        .filter(r => r.menu.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(r => [r.tanggal, r.menu, r.terjual]),
      headStyles: { fillColor: [219, 68, 68], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [255, 240, 240] },
      columnStyles: {
        2: { halign: 'center', fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 }
    });

    // Save
    doc.save(`Laporan_Penjualan_${startDate}_sd_${endDate}.pdf`);
    showToast("PDF Berhasil diunduh!");
  };

  return (
    <div style={s.page}>
      {toast && <div style={{ ...s.toast, background: toast.color }}>{toast.msg}</div>}

      <main style={s.main}>
        {/* UI HEADER */}
        <div style={s.headerRow}>
          <div>
            <h1 style={s.h1}>Laporan Penjualan</h1>
            <p style={s.subtitle}>Data real-time · diperbarui otomatis setiap 30 detik</p>
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

        {/* UI FILTER */}
        <div style={s.filterRow}>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={s.dateInput} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={s.dateInput} />
          <button onClick={applyFilter} style={s.btnTampilkan}>{loading ? "..." : "Tampilkan"}</button>
          <div style={s.liveChip}><span style={s.liveDot} />Live</div>
        </div>

        {/* INFO CARDS (Tampilan Dashboard) */}
        <div style={s.cardsGrid}>
          {[
            { label: "Total Pesanan", value: summary?.totalPesanan ?? 0, bg: "#e53e3e", sub: "pesanan total" },
            { label: "Total Pendapatan", value: `Rp ${Number(summary?.pendapatan || 0).toLocaleString('id-ID')}`, bg: "#d97706", sub: "revenue bersih" },
            { label: "Total Menu Terjual", value: summary?.totalItem ?? 0, bg: "#dc2626", sub: "item terjual" },
            { label: "Menu Terlaris", value: summary?.terlaris ?? "—", bg: "#16a34a", sub: "paling banyak dipesan" }
          ].map((c, i) => (
            <div key={i} style={{ ...s.card, background: c.bg, opacity: animCards ? 1 : 0 }}>
              <div style={s.cardLabel}>{c.label}</div>
              <div style={s.cardValue}>{c.value}</div>
              <div style={s.cardDivider}><div style={s.cardSub}>{c.sub}</div></div>
            </div>
          ))}
        </div>

        {/* GRAPH & TABLES */}
        <div style={s.midRow}>
          <div style={s.panel}>
            <div style={s.panelTitle}>Grafik Penjualan</div>
            <div style={{ marginTop: 20, height: 250 }}><LineChart data={chartData} /></div>
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
                {detailRows.filter(r => r.menu.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 10).map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
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
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={s.td}>{row.name}</td>
                    <td style={s.td}>{row.qty}</td>
                    <td style={{ ...s.td, fontWeight: 700, color: "#d97706" }}>Rp {Number(row.revenue).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* EXPORT ACTION */}
        <div style={s.exportRow}>
          <button onClick={handleDownloadPDF} style={s.btnPdf}>⬇ Unduh PDF</button>
        </div>
      </main>
    </div>
  );
}

// ── STYLES ──
const s = {
  page: { minHeight: "100vh", background: "#f3f4f6", width: "100%", boxSizing: "border-box" },
  toast: { position: "fixed", top: 20, right: 20, zIndex: 9999, color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  main: { padding: "28px 32px", width: "100%", boxSizing: "border-box" },
  headerRow: { display: "flex", justifyContent: "space-between", marginBottom: 20 },
  h1: { fontSize: 22, fontWeight: 800, margin: 0 },
  subtitle: { color: "#9ca3af", fontSize: 12 },
  searchInput: { paddingLeft: 34, paddingRight: 14, borderRadius: 8, border: "1px solid #e5e7eb", height: 35, width: 280 },
  searchIcon: { width: 14, height: 14, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" },
  filterRow: { display: "flex", gap: 8, marginBottom: 22, alignItems: "center" },
  dateInput: { border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "8px", fontSize: 13, width: 160 },
  btnTampilkan: { background: "#e53e3e", color: "#fff", border: "none", padding: "8px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer" },
  liveChip: { display: "flex", alignItems: "center", gap: 5, background: "#dcfce7", color: "#16a34a", fontSize: 11, padding: "5px 10px", borderRadius: 20 },
  liveDot: { width: 7, height: 7, borderRadius: "50%", background: "#16a34a" },
  cardsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 22 },
  card: { padding: "20px", borderRadius: 18, color: "#fff", transition: "0.3s" },
  cardLabel: { fontSize: 12, fontWeight: 500, opacity: 0.8, marginBottom: 5 },
  cardValue: { fontSize: 20, fontWeight: 700 },
  cardDivider: { borderTop: "1px solid rgba(255,255,255,0.3)", marginTop: 10, paddingTop: 8 },
  cardSub: { fontSize: 11, opacity: 0.8 },
  midRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 22 },
  panel: { background: "#fff", borderRadius: 12, padding: "20px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" },
  panelTitle: { fontSize: 13, fontWeight: 700 },
  tableWrap: { background: "#fff", borderRadius: 12, overflow: "hidden" },
  tableHeaderTitle: { padding: "15px 20px", fontSize: 13, fontWeight: 700 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", color: "#fff", textAlign: "left", fontSize: 12 },
  td: { padding: "10px 12px", fontSize: 12, borderBottom: "1px solid #f0f0f0" },
  exportRow: { display: "flex", justifyContent: "flex-end" },
  btnPdf: { background: "#e53e3e", color: "#fff", border: "none", padding: "10px 25px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }
};