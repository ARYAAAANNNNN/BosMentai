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
  const [startDate, setStartDate] = useState(weekAgo());
  const [endDate,   setEndDate]   = useState(today());

  // real-time state
  const [loading,    setLoading]    = useState(false);
  const [summary,    setSummary]    = useState(null);
  const [detailRows, setDetailRows] = useState([]);
  const [categoryRows, setCategoryRows] = useState([]);
  const [chartData,  setChartData]  = useState([]);
  const [toast,      setToast]      = useState(null);
  const [animCards,  setAnimCards]  = useState(true);
  const [selectedRow, setSelectedRow] = useState(null);

  // ── helpers ───────────────────────────────────────────────────────
  const showToast = (msg, color = "#e53e3e") => {
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

      if (sumJson.success)    setSummary(sumJson.data);
      if (detailJson.success) setDetailRows(detailJson.data);
      if (catJson.success)    setCategoryRows(catJson.data);
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
    } catch {
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
    const id = setInterval(() => fetchAll(startDate, endDate, true), 30_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── derived card values ───────────────────────────────────────
  const totalPesanan = summary?.totalPesanan ?? "—";
  const totalItem    = summary?.totalItem    ?? "—";
  const pendapatan   = summary?.pendapatan   ? `Rp ${summary.pendapatan.toLocaleString('id-ID')}` : "Rp 0";
  const terlaris     = summary?.terlaris     ?? "—";

  const cards = [
    { label: "Total Pesanan",      value: totalPesanan, sub: "pesanan total",        bg: "#e53e3e" },
    { label: "Total Pendapatan",   value: pendapatan,   sub: "revenue bersih",        bg: "#d97706" },
    { label: "Total Menu Terjual", value: totalItem,    sub: "item terjual",          bg: "#dc2626" },
    { label: "Menu Terlaris",      value: terlaris,     sub: "paling banyak dipesan", bg: "#16a34a" },
  ];

  // ── total baris tabel ─────────────────────────────────────────
  const totalTerjualAll = detailRows.reduce((s, r) => s + Number(r.terjual), 0);

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
            <input type="text" placeholder="cari menu..." style={s.searchInput} />
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
          {/* live indicator */}
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
                e.currentTarget.style.transform  = "translateY(-4px)";
                e.currentTarget.style.boxShadow  = "0 8px 24px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform  = "translateY(0)";
                e.currentTarget.style.boxShadow  = "0 2px 10px rgba(0,0,0,0.08)";
              }}
              style={{
                ...s.card,
                background: c.bg,
                padding: "20px 24px",
                borderRadius: 18,
                minHeight: 110,
                opacity:   animCards ? 1 : 0,
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
            <div style={s.panelTitle}>Rincian Penjualan per Menu</div>
            <table style={s.table}>
                <thead>
                <tr style={{ background: "#e53e3e" }}>
                    {["Tanggal", "Menu", "Terjual"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {detailRows.length === 0 ? (
                    <tr>
                    <td colSpan={3} style={s.tdEmpty}>Tidak ada data pada rentang ini</td>
                    </tr>
                ) : (
                    detailRows.slice(0, 10).map((row, i) => (
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
            <div style={s.panelTitle}>Laporan per Kategori</div>
            <table style={s.table}>
                <thead>
                <tr style={{ background: "#d97706" }}>
                    {["Kategori", "Item Terjual", "Pendapatan"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                    ))}
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
              showToast("Membuat Laporan PDF...", "#e53e3e");
              try {
                const res  = await fetch(`${API}/api/laporan/export/pdf?dari=${startDate}&sampai=${endDate}`);
                const json = await res.json();
                if (!json.success) throw new Error(json.message);

                const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

                // ── Background Header ────────────────────────────
                doc.setFillColor(229, 62, 62);
                doc.rect(0, 0, 210, 45, "F");
                
                // ── Restoran Name ────────────────────────────────
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(22);
                doc.setFont("helvetica", "bold");
                doc.text("BOS MENTAI & DIMSUM", 14, 18);
                
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                doc.text("Laporan Analisis Penjualan & Performa Menu", 14, 25);
                
                // ── Info Periode ─────────────────────────────────
                doc.setFontSize(9);
                doc.text(`Periode Laporan : ${startDate} s/d ${endDate}`, 14, 34);
                doc.text(`Tanggal Cetak   : ${new Date().toLocaleString('id-ID')}`, 14, 39);

                // ── Stats Row ────────────────────────────────────
                let currentY = 55;
                doc.setTextColor(40, 40, 40);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.text("RINGKASAN PERFORMA", 14, currentY);
                
                currentY += 8;
                doc.setDrawColor(229, 62, 62);
                doc.setLineWidth(0.5);
                doc.line(14, currentY - 5, 60, currentY - 5);

                const stats = [
                  { l: "Total Pendapatan", v: `Rp ${json.total_pendapatan.toLocaleString('id-ID')}` },
                  { l: "Total Item Terjual", v: `${json.total_terjual} pcs` },
                  { l: "Menu Terlaris", v: json.data[0]?.menu || "-" }
                ];

                doc.setFontSize(9);
                stats.forEach((s, i) => {
                  doc.setFont("helvetica", "bold");
                  doc.text(s.l, 14 + (i * 65), currentY);
                  doc.setFont("helvetica", "normal");
                  doc.text(s.v, 14 + (i * 65), currentY + 5);
                });

                currentY += 18;

                // ── Tabel 1: Per Kategori ────────────────────────
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.text("LAPORAN PER KATEGORI", 14, currentY);
                
                autoTable(doc, {
                  startY: currentY + 4,
                  head: [["Kategori", "Jumlah Terjual", "Total Pendapatan"]],
                  body: categoryRows.map(r => [
                    r.name, 
                    `${r.qty} item`, 
                    `Rp ${(r.revenue || 0).toLocaleString('id-ID')}`
                  ]),
                  theme: "striped",
                  headStyles: { fillColor: [217, 119, 6], textColor: 255, fontStyle: 'bold' },
                  styles: { fontSize: 9, cellPadding: 3 },
                  margin: { left: 14, right: 14 }
                });

                currentY = doc.lastAutoTable.finalY + 12;

                // ── Tabel 2: Detail Menu ─────────────────────────
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.text("RINCIAN PENJUALAN PER MENU", 14, currentY);

                autoTable(doc, {
                  startY: currentY + 4,
                  head: [["Tanggal", "Nama Menu", "Item Terjual"]],
                  body: json.data.map(r => [r.tanggal, r.menu, r.terjual]),
                  theme: "grid",
                  headStyles: { fillColor: [229, 62, 62], textColor: 255, fontStyle: 'bold' },
                  styles: { fontSize: 8.5, cellPadding: 3 },
                  alternateRowStyles: { fillColor: [255, 245, 245] },
                  columnStyles: {
                    0: { cellWidth: 35 },
                    1: { cellWidth: 110 },
                    2: { cellWidth: 35, halign: 'center' }
                  },
                  margin: { left: 14, right: 14 }
                });

                // ── Footer ───────────────────────────────────────
                const pageCount = doc.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                  doc.setPage(i);
                  doc.setFontSize(8);
                  doc.setTextColor(150, 150, 150);
                  doc.text(`Halaman ${i} dari ${pageCount}`, 196, 288, { align: "right" });
                  doc.text("Laporan ini dihasilkan secara otomatis oleh Sistem Manajemen Bos Mentai", 14, 288);
                }

                doc.save(`Laporan_BosMentai_${startDate}_sd_${endDate}.pdf`);
                showToast("PDF Berhasil Diunduh ✅", "#16a34a");
              } catch (err) {
                console.error(err);
                showToast("Gagal Export PDF: " + err.message, "#ef4444");
              }
            }}
            style={s.btnPdf}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#c53030")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#e53e3e")}>
            ⬇ Download Laporan PDF
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
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    fontFamily: "'Segoe UI', sans-serif",
    position: "relative",
    width: "100%",
    boxSizing: "border-box",
    zIndex: 0,
  },
  toast: {
    position: "fixed", top: 20, right: 20, zIndex: 9999,
    color: "#fff", padding: "10px 18px", borderRadius: 10,
    fontSize: 13, boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
    animation: "fadeIn 0.3s ease",
  },
  main: {
    padding: "28px 32px",
    position: "relative",
    zIndex: 1,
    minHeight: "calc(100vh - 56px)",
    display: "block",
    width: "100%",
    boxSizing: "border-box",
  },

  // header
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  h1: { fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 },
  subtitle: { color: "#9ca3af", fontSize: 12, marginTop: 4 },
  searchIcon: { width: 14, height: 14, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" },
  searchInput: {
    paddingLeft: 34, paddingRight: 14, paddingTop: 8, paddingBottom: 8,
    borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff",
    fontSize: 13, outline: "none", width: 280, color: "#374151",
  },

  // filter
  filterRow: { display: "flex", gap: 8, marginBottom: 22, alignItems: "center" },
  dateInput: {
    border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "9px 14px",
    fontSize: 13, outline: "none", color: "#374151",
    background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", width: 170,
  },
  btnTampilkan: {
    background: "#e53e3e", color: "#fff", border: "none",
    padding: "9px 28px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
  },
  liveChip: {
    display: "flex", alignItems: "center", gap: 5,
    background: "#dcfce7", color: "#16a34a",
    fontSize: 11, fontWeight: 700, padding: "5px 10px",
    borderRadius: 20, border: "1px solid #bbf7d0",
  },
  liveDot: {
    width: 7, height: 7, borderRadius: "50%",
    background: "#16a34a",
    animation: "pulse 1.5s infinite",
    display: "inline-block",
  },

  // cards
  cardsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 22 },
  card: {
    borderRadius: 12, padding: "14px 16px", color: "#fff",
    cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
    minHeight: 96, display: "flex", flexDirection: "column", justifyContent: "space-between",
  },
  cardLabel: { fontSize: 10, opacity: 0.85 },
  cardValue: { fontWeight: 800, lineHeight: 1 },
  cardSub: { fontSize: 10, opacity: 0.75, marginTop: 4 },

  // mid row
  midRow: { display: "grid", gridTemplateColumns: "55% 1fr", gap: 16, marginBottom: 22 },
  panel: {
    background: "#fff",
    borderRadius: 12,
    padding: "20px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
    minHeight: 200,
  },
  panelTitle: { fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 10 },

  // table
  tableWrap: { background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 16 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { padding: "12px 18px", textAlign: "left", color: "#fff", fontWeight: 700 },
  td: { padding: "11px 18px", textAlign: "left", color: "#374151" },
  tdEmpty: { textAlign: "center", padding: 28, color: "#9ca3af" },
  tfootTd: { padding: "11px 18px", textAlign: "left", fontWeight: 700, color: "#374151", fontSize: 12 },



  // export
  exportRow: { display: "flex", justifyContent: "flex-end", gap: 16, paddingBottom: 16 },
  btnPdf:   { background: "#e53e3e", color: "#fff", border: "none", padding: "10px 36px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" },
};
