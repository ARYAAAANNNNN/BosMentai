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

// ─── main page ────────────────────────────────────────────────────
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
  const [selectedRow, setSelectedRow] = useState(null);
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
      if (catJson.success) setCategoryRows(catJson.data);
      if (chartJson.success) {
        setChartData(
          chartJson.data.map((r) => ({
            tanggal: r.label,
            pendapatan: r.total,
          }))
        );
      }

      if (!quiet) {
        setAnimCards(false);
        setTimeout(() => setAnimCards(true), 50);
        showToast(`Data diperbarui — ${detailJson.data?.length ?? 0} baris`);
      }
    } catch (err) {
      if (!quiet) showToast("Gagal memuat data dari server", "#ef4444");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  // initial + filter button
  const applyFilter = () => {
    if (!startDate || !endDate || startDate > endDate) {
      showToast("Rentang tanggal tidak valid!", "#ef4444");
      return;
    }
    setSelectedRow(null);
    fetchAll(startDate, endDate);
  };

  // mount + auto-refresh 30 s
  useEffect(() => {
    fetchAll(startDate, endDate);
    const id = setInterval(() => fetchAll(startDate, endDate, true), 30000);
    return () => clearInterval(id);
  }, [fetchAll, startDate, endDate]);

  // ── derived card values ───────────────────────────────────────
  const totalPesanan = summary?.totalPesanan ?? "—";
  const totalItem = summary?.totalItem ?? "—";
  const pendapatan = summary?.pendapatan ? `Rp ${summary.pendapatan.toLocaleString('id-ID')}` : "Rp 0";
  const terlaris = summary?.terlaris ?? "—";

  const cards = [
    { label: "Total Pesanan", value: totalPesanan, sub: "pesanan total", bg: "#e53e3e" },
    { label: "Total Pendapatan", value: pendapatan, sub: "revenue bersih", bg: "#d97706" },
    { label: "Total Menu Terjual", value: totalItem, sub: "item terjual", bg: "#dc2626" },
    { label: "Menu Terlaris", value: terlaris, sub: "paling banyak dipesan", bg: "#16a34a" },
  ];

  return (
    <div style={s.page}>
      {/* Toast */}
      {toast && (
        <div style={{ ...s.toast, background: toast.color }}>{toast.msg}</div>
      )}

      <main style={s.main}>

        {/* ── Header ── */}
        <div style={s.headerRow}>
          <div>
            <h1 style={s.h1}>Laporan Penjualan</h1>
            <p style={s.subtitle}>
              Data real-time · diperbarui otomatis setiap 30 detik
            </p>
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

        {/* ── Filter ── */}
        <div style={s.filterRow}>
          <input type="date" value={startDate}
            onChange={(e) => setStartDate(e.target.value)} style={s.dateInput} />
          <input type="date" value={endDate}
            onChange={(e) => setEndDate(e.target.value)} style={s.dateInput} />
          <button onClick={applyFilter} style={s.btnTampilkan}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#c53030")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#e53e3e")}>
            {loading ? "Memuat..." : "Tampilkan"}
          </button>
          <div style={s.liveChip}>
            <span style={s.liveDot} />
            Live
          </div>
        </div>

        {/* ── Cards ── */}
        <div style={s.cardsGrid}>
          {cards.map((c, i) => (
            <div key={i}
              onClick={() => showToast(`${c.label}: ${c.value}`, c.bg)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)";
              }}
              style={{
                ...s.card,
                background: c.bg,
                padding: "20px 24px",
                borderRadius: 18,
                minHeight: 110,
                opacity: animCards ? 1 : 0,
                transform: animCards ? "translateY(0)" : "translateY(12px)",
                transition: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`,
              }}>
              <div style={{ ...s.cardLabel, fontSize: 13, fontWeight: 500, opacity: 0.9, marginBottom: 8 }}>{c.label}</div>
              <div style={{
                ...s.cardValue,
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 10,
                lineHeight: 1.1,
              }}>{c.value}</div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.4)", width: "100%", paddingTop: 8 }}>
                <div style={{ ...s.cardSub, fontSize: 11, opacity: 0.8, fontWeight: 400 }}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Mid row: Chart + Recent Orders ── */}
        <div style={s.midRow}>
          <div style={s.panel}>
            <div style={s.panelTitle}>Grafik Jumlah Item yang Terjual</div>
            <LineChart data={chartData} />
          </div>

          <div style={s.panel}>
            <RecentOrders />
          </div>
        </div>

        {/* ── Table: Tanggal | Menu | Terjual ── */}
        <div style={s.midRow}>
          <div style={s.tableWrap}>
            <div style={{ ...s.panelTitle, padding: '20px 20px 10px' }}>Rincian Penjualan per Menu</div>
            <table style={s.table}>
              <thead>
                <tr style={{ background: "#e53e3e" }}>
                  <th style={s.th}>Tanggal</th>
                  <th style={s.th}>Menu</th>
                  <th style={s.th}>Terjual</th>
                </tr>
              </thead>
              <tbody>
                {detailRows.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={s.tdEmpty}>Tidak ada data pada rentang ini</td>
                  </tr>
                ) : (
                  detailRows
                    .filter(r => r.menu.toLowerCase().includes(searchTerm.toLowerCase()))
                    .slice(0, 10)
                    .map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={s.td}>{row.tanggal}</td>
                        <td style={s.td}>{row.menu}</td>
                        <td style={{ ...s.td, fontWeight: 700, color: "#e53e3e" }}>{row.terjual}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          <div style={s.tableWrap}>
            <div style={{ ...s.panelTitle, padding: '20px 20px 10px' }}>Laporan per Kategori</div>
            <table style={s.table}>
              <thead>
                <tr style={{ background: "#d97706" }}>
                  <th style={s.th}>Kategori</th>
                  <th style={s.th}>Item Terjual</th>
                  <th style={s.th}>Pendapatan</th>
                </tr>
              </thead>
              <tbody>
                {categoryRows.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={s.tdEmpty}>Tidak ada data</td>
                  </tr>
                ) : (
                  categoryRows.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={s.td}>{row.name}</td>
                      <td style={s.td}>{row.qty}</td>
                      <td style={{ ...s.td, fontWeight: 700, color: "#d97706" }}>
                        Rp {(row.revenue || 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Export ── */}
        <div style={s.exportRow}>
          <button
            onClick={async () => {
              showToast("Membuat PDF...", "#e53e3e");
              try {
                const res = await fetch(`${API}/api/laporan/export/pdf?dari=${startDate}&sampai=${endDate}`);
                const json = await res.json();
                if (!json.success) throw new Error(json.message);

                const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

                doc.setFillColor(229, 62, 62);
                doc.rect(0, 0, 210, 30, "F");
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text(json.nama_restoran || "BOS MENTAI", 14, 12);
                doc.setFontSize(9);
                doc.setFont("helvetica", "normal");
                doc.text("Laporan Penjualan Resmi", 14, 19);
                doc.text(`Periode: ${json.periode}`, 14, 25);
                doc.text(`Dicetak: ${json.dicetak}`, 120, 25);

                doc.setTextColor(60, 60, 60);
                doc.setFontSize(9);
                doc.setFont("helvetica", "bold");
                doc.text(`Total Item Terjual: ${json.total_terjual}`, 14, 38);

                autoTable(doc, {
                  startY: 44,
                  head: [["Tanggal", "Menu", "Terjual"]],
                  body: [
                    ...json.data.map(r => [r.tanggal, r.menu, r.terjual]),
                    [{ content: "", styles: { fillColor: [240, 240, 240] } }, { content: "TOTAL", styles: { fontStyle: "bold", fillColor: [240, 240, 240] } }, { content: String(json.total_terjual), styles: { fontStyle: "bold", textColor: [229, 62, 62], fillColor: [240, 240, 240] } }],
                  ],
                  headStyles: {
                    fillColor: [229, 62, 62],
                    textColor: [255, 255, 255],
                    fontStyle: "bold",
                    fontSize: 9,
                  },
                  bodyStyles: { fontSize: 8.5, textColor: [55, 65, 81] },
                  alternateRowStyles: { fillColor: [255, 247, 247] },
                  columnStyles: {
                    0: { cellWidth: 28 },
                    1: { cellWidth: 120 },
                    2: { cellWidth: 22, halign: "center", fontStyle: "bold" },
                  },
                  margin: { left: 14, right: 14 },
                });

                const pageH = doc.internal.pageSize.height;
                doc.setFontSize(8);
                doc.setTextColor(160, 160, 160);
                doc.text("© Bos Mentai & Dimsum — QR SmartOrder System", 14, pageH - 8);
                doc.text(`Halaman 1`, 190, pageH - 8, { align: "right" });

                doc.save(`laporan_penjualan_${startDate}_sd_${endDate}.pdf`);
                showToast("PDF berhasil diunduh ✅", "#16a34a");
              } catch (err) {
                console.error(err);
                showToast("Gagal membuat PDF: " + err.message, "#ef4444");
              }
            }}
            style={s.btnPdf}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#c53030")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#e53e3e")}>
            ⬇ Export PDF
          </button>
        </div>

      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        input[type="date"]::-webkit-calendar-picker-indicator { cursor:pointer; }
      `}</style>
    </div>
  );
}

// ─── styles ───────────────────────────────────────────────────────
const s = {
  page: { minHeight: "100vh", background: "#f3f4f6", fontFamily: "'Segoe UI', sans-serif", width: "100%", boxSizing: "border-box" },
  toast: { position: "fixed", top: 20, right: 20, zIndex: 9999, color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 13, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", animation: "fadeIn 0.3s ease" },
  main: { padding: "28px 32px", width: "100%", boxSizing: "border-box" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  h1: { fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 },
  subtitle: { color: "#9ca3af", fontSize: 12, marginTop: 4 },
  searchIcon: { width: 14, height: 14, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" },
  searchInput: { paddingLeft: 34, paddingRight: 14, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, outline: "none", width: 280, color: "#374151" },
  filterRow: { display: "flex", gap: 8, marginBottom: 22, alignItems: "center" },
  dateInput: { border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "9px 14px", fontSize: 13, outline: "none", color: "#374151", background: "#fff", width: 170 },
  btnTampilkan: { background: "#e53e3e", color: "#fff", border: "none", padding: "9px 28px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "0.2s" },
  liveChip: { display: "flex", alignItems: "center", gap: 5, background: "#dcfce7", color: "#16a34a", fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 20, border: "1px solid #bbf7d0" },
  liveDot: { width: 7, height: 7, borderRadius: "50%", background: "#16a34a", animation: "pulse 1.5s infinite", display: "inline-block" },
  cardsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 22 },
  card: { borderRadius: 12, color: "#fff", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.10)", display: "flex", flexDirection: "column", justifyContent: "space-between" },
  cardLabel: { textTransform: "uppercase", letterSpacing: "0.5px" },
  cardValue: { display: "block" },
  cardSub: { display: "block" },
  midRow: { display: "grid", gridTemplateColumns: "55% 1fr", gap: 16, marginBottom: 22 },
  panel: { background: "#fff", borderRadius: 12, padding: "20px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", minHeight: 200 },
  panelTitle: { fontSize: 13, fontWeight: 700, color: "#111827" },
  tableWrap: { background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { padding: "12px 18px", textAlign: "left", color: "#fff", fontWeight: 700 },
  td: { padding: "11px 18px", textAlign: "left", color: "#374151" },
  tdEmpty: { textAlign: "center", padding: 28, color: "#9ca3af" },
  exportRow: { display: "flex", justifyContent: "flex-end", gap: 16, paddingBottom: 16 },
  btnPdf: { background: "#e53e3e", color: "#fff", border: "none", padding: "10px 36px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "0.2s" },
};