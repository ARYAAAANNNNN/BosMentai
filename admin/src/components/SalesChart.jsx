import React, { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { statsAPI } from "../services/api";

// 1. Mapping Warna Khusus Sesuai Identitas Menu
const MENU_COLORS = {
  "ayam karage": "#FF6B6B",        // Merah Coral
  "dimsum mentai": "#FB923C",      // Orange
  "gyoza mentai": "#FACC15",       // Kuning Keemasan
  "lumpia ayam": "#D4A373",        // Coklat Muda
  "air aqua": "#7DD3FC",           // Biru Muda
  "lemon tea": "#FEF08A",          // Kuning Lemon
  "lychee tea": "#FDA4AF",         // Pink
  "manggo yakult": "#F97316",      // Orange Mango
  "matcha": "#86EFAC",             // Hijau Matcha
  "thai tea": "#FB923C",           // Orange Thai Tea
  "cheese roll": "#F5F5DC",        // Cream / Beige
  "kulit ayam krispi": "#A52A2A",  // Coklat Crispy
  "default": "#94A3B8"             // Abu-abu jika tidak terdaftar
};

const FALLBACK = [
  { name: "dimsum mentai", value: 35 },
  { name: "ayam karage", value: 25 },
  { name: "matcha", value: 20 },
  { name: "air aqua", value: 20 },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div style={{
      background: "rgba(26, 32, 44, 0.95)",
      color: "#fff",
      borderRadius: "10px",
      padding: "8px 14px",
      fontSize: "12px",
      fontWeight: "600",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      border: `1px solid ${payload[0].fill}`,
      pointerEvents: "none",
      backdropFilter: "blur(4px)"
    }}>
      <div style={{ textTransform: "capitalize", marginBottom: "2px" }}>{payload[0].name}</div>
      <div style={{ fontSize: "14px", color: payload[0].fill }}>{payload[0].value}%</div>
    </div>
  );
};

export default function SalesChart({ data: propsData }) {
  const [salesData, setSalesData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  // Fungsi untuk mendapatkan warna berdasarkan nama menu (case-insensitive)
  const getColor = (name) => {
    return MENU_COLORS[name.toLowerCase()] || MENU_COLORS.default;
  };

  // Sinkronisasi data dari props (misal data mingguan)
  useEffect(() => {
    if (propsData && propsData.length > 0) {
      const total = propsData.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
      const processed = propsData.map((item, idx) => ({
        name: item.label || item.name,
        value: total > 0 ? Math.round((Number(item.value) / total) * 100) : 0,
        color: Object.values(MENU_COLORS)[idx % Object.values(MENU_COLORS).length]
      }));
      setSalesData(processed);
    }
  }, [propsData]);

  const fetchChart = useCallback(async () => {
    if (propsData) return; // Prioritaskan data dari props
    
    try {
      const json = await statsAPI.getSalesChart();
      const dataToProcess = (json.success && Array.isArray(json.data) && json.data.length > 0) 
        ? json.data 
        : FALLBACK;

      const processedData = dataToProcess.map(item => ({
        ...item,
        color: getColor(item.name)
      }));
      
      setSalesData(processedData);
    } catch {
      setSalesData(FALLBACK.map(item => ({ ...item, color: getColor(item.name) })));
    }
  }, [propsData]);

  useEffect(() => {
    if (!propsData) {
      fetchChart();
      const id = setInterval(fetchChart, 30000);
      return () => clearInterval(id);
    }
  }, [fetchChart, propsData]);

  return (
    <div style={{
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
    }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1E293B", marginBottom: 16 }}>
        Statistik Penjualan Menu
      </h2>

      <div style={{
        flex: 1, display: "flex", flexDirection: "row",
        alignItems: "center", justifyContent: "space-between",
        gap: 20, minHeight: 0,
      }}>
        
        {/* Donut Chart Container */}
        <div style={{ width: "160px", height: "160px", position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={salesData}
                cx="50%" cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={5}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
                animationBegin={0}
                animationDuration={1200}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {salesData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    style={{
                      filter: activeIndex === index ? 'drop-shadow(0px 0px 6px rgba(0,0,0,0.2))' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease-out',
                      transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: 'center'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Container */}
        <div style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          gap: "10px",
          maxHeight: "180px",
          overflowY: "auto",
          paddingRight: "10px"
        }}>
          {salesData.map((item, index) => (
            <div 
              key={item.name} 
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                padding: "6px 8px",
                borderRadius: "8px",
                background: activeIndex === index ? "#F1F5F9" : "transparent",
                transition: "all 0.2s ease",
                cursor: "default"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: "3px",
                  background: item.color, 
                  flexShrink: 0,
                  boxShadow: `0 2px 4px ${item.color}44`
                }} />
                <span style={{ 
                  fontSize: "12px", 
                  color: "#475569", 
                  textTransform: "capitalize",
                  fontWeight: activeIndex === index ? "700" : "500" 
                }}>
                  {item.name}
                </span>
              </div>
              <span style={{ 
                fontSize: "12px", 
                fontWeight: "700", 
                color: activeIndex === index ? item.color : "#94A3B8" 
              }}>
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}