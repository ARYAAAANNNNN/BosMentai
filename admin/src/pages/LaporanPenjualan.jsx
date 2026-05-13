import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Download, RefreshCw } from "lucide-react";
import LineChart from "./LineChart.jsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const API = import.meta.env.VITE_API_URL || "";

export default function LaporanPenjualan() {
  // --- STATE ---
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalPesanan: 0,
    totalItem: 0,
    pendapatan: 0,
    terlaris: "-"
  });
  const [detailRows, setDetailRows] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // --- MENGAMBIL DATA DARI API ---
  const fetchAllData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const qs = `dari=${startDate}&sampai=${endDate}`;

      const [sumRes, detailRes, chartRes] = await Promise.all([
        fetch(`${API}/api/laporan/summary?${qs}`),
        fetch(`${API}/api/laporan/detail-menu?${qs}`),
        fetch(`${API}/api/laporan/chart?${qs}`)
      ]);

      const sumJson = await sumRes.json();
      const detailJson = await detailRes.json();
      const chartJson = await chartRes.json();

      if (sumJson.success) setSummary(sumJson.data);
      if (detailJson.success) setDetailRows(detailJson.data);
      if (chartJson.success) {
        setChartData(chartJson.data.map(r => ({ label: r.label, value: r.total })));
      }
    } catch (err) {
      console.error("Gagal mengambil data laporan:", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => fetchAllData(true), 30000); // Auto refresh 30 detik
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // --- FILTER PENCARIAN TABEL ---
  const filteredRows = useMemo(() => {
    return detailRows.filter(r =>
      r.menu.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [detailRows, searchTerm]);

  // --- EXPORT PDF (TANPA PAJAK) ---
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("LAPORAN PENJUALAN BOS MENTAI", 14, 15);
    doc.setFontSize(10);
    doc.text(`Periode: ${startDate} s/d ${endDate}`, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [["Tanggal", "Nama Menu", "Terjual"]],
      body: filteredRows.map(r => [r.tanggal, r.menu, r.terjual]),
      headStyles: { fillColor: [229, 62, 62] }
    });

    doc.save(`Laporan_${startDate}_to_${endDate}.pdf`);
  };

  return (
    <div style={styles.container}>
      {/* HEADER & FILTER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard Penjualan</h1>
        <div style={styles.filterBar}>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={styles.inputDate} />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={styles.inputDate} />
          <button onClick={() => fetchAllData()} style={styles.btnFilter}>
            {loading ? <RefreshCw className="animate-spin" /> : "Tampilkan"}
          </button>
        </div>
      </div>

      {/* CARD RINGKASAN */}
      <div style={styles.gridCards}>
        <Card label="Total Pendapatan" value={`Rp ${Number(summary.pendapatan).toLocaleString('id-ID')}`} color="#d97706" />
        <Card label="Total Pesanan" value={summary.totalPesanan} color="#e53e3e" />
        <Card label="Item Terjual" value={summary.totalItem} color="#16a34a" />
        <Card label="Menu Terlaris" value={summary.terlaris} color="#2563eb" />
      </div>

      {/* GRAFIK */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Tren Penjualan (Harian)</h3>
        <div style={{ height: 300, marginTop: 20 }}>
          <LineChart data={chartData} />
        </div>
      </div>

      {/* TABEL RINCIAN */}
      <div style={styles.section}>
        <div style={styles.tableHeader}>
          <h3 style={styles.sectionTitle}>Rincian Penjualan per Menu</h3>
          <div style={styles.searchBox}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={styles.inputSearch}
            />
          </div>
        </div>
        <table style={styles.table}>
          <thead>
            <tr style={styles.trHead}>
              <th style={styles.th}>Tanggal</th>
              <th style={styles.th}>Nama Menu</th>
              <th style={styles.th}>Terjual</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, i) => (
              <tr key={i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                <td style={styles.td}>{row.tanggal}</td>
                <td style={styles.td}>{row.menu}</td>
                <td style={{ ...styles.td, fontWeight: 'bold', color: '#e53e3e' }}>{row.terjual} pcs</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={downloadPDF} style={styles.btnPdf}>
        <Download size={18} /> Unduh Laporan PDF
      </button>
    </div>
  );
}

// --- SUB KOMPONEN CARD ---
function Card({ label, value, color }) {
  return (
    <div style={{ ...styles.card, backgroundColor: color }}>
      <div style={styles.cardLabel}>{label}</div>
      <div style={styles.cardValue}>{value}</div>
    </div>
  );
}

// --- STYLING ---
const styles = {
  container: { padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  title: { fontSize: "24px", fontWeight: "800", color: "#1e293b" },
  filterBar: { display: "flex", gap: "10px" },
  inputDate: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" },
  btnFilter: { backgroundColor: "#e53e3e", color: "white", border: "none", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  gridCards: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "30px" },
  card: { padding: "20px", borderRadius: "15px", color: "white", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" },
  cardLabel: { fontSize: "14px", opacity: 0.9, marginBottom: "5px" },
  cardValue: { fontSize: "22px", fontWeight: "700" },
  section: { backgroundColor: "white", padding: "25px", borderRadius: "15px", marginBottom: "30px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  sectionTitle: { fontSize: "16px", fontWeight: "700", color: "#334155" },
  tableHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
  searchBox: { display: "flex", alignItems: "center", gap: "8px", border: "1px solid #e2e8f0", padding: "5px 12px", borderRadius: "8px" },
  inputSearch: { border: "none", outline: "none", fontSize: "14px" },
  table: { width: "100%", borderCollapse: "collapse" },
  trHead: { backgroundColor: "#f1f5f9", textAlign: "left" },
  th: { padding: "12px", fontSize: "13px", color: "#64748b", fontWeight: "600" },
  td: { padding: "12px", fontSize: "14px", borderBottom: "1px solid #f1f5f9" },
  trEven: { backgroundColor: "#ffffff" },
  trOdd: { backgroundColor: "#f8fafc" },
  btnPdf: { display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#1e293b", color: "white", border: "none", padding: "12px 25px", borderRadius: "10px", cursor: "pointer", fontWeight: "600", float: "right" }
};