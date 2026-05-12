import React, { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { statsAPI } from "../services/api";

const MENU_COLORS = {
  "ayam karage": "#FF6B6B",
  "dimsum mentai": "#FB923C",
  "gyoza mentai": "#FACC15",
  "lumpia ayam": "#D4A373",
  "air aqua": "#7DD3FC",
  "lemon tea": "#FEF08A",
  "lychee tea": "#FDA4AF",
  "manggo yakult": "#F97316",
  "matcha": "#86EFAC",
  "thai tea": "#FB923C",
  "cheese roll": "#F5F5DC",
  "kulit ayam krispi": "#A52A2A",
  "default": "#94A3B8"
};

const FALLBACK = [
  { name: "dimsum mentai", value: 15, qty: 150 },
  { name: "ayam karage", value: 12, qty: 120 },
  { name: "matcha", value: 10, qty: 100 },
  { name: "air aqua", value: 10, qty: 100 },
  { name: "lemon tea", value: 8, qty: 80 },
  { name: "lychee tea", value: 8, qty: 80 },
  { name: "gyoza mentai", value: 7, qty: 70 },
  { name: "lumpia ayam", value: 7, qty: 70 },
  { name: "manggo yakult", value: 6, qty: 60 },
  { name: "thai tea", value: 6, qty: 60 },
  { name: "cheese roll", value: 6, qty: 60 },
  { name: "kulit ayam krispi", value: 5, qty: 50 },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div style={{
      background: "rgba(26, 32, 44, 0.95)",
      color: "#fff",
      borderRadius: "10px",
      padding: "10px 14px",
      fontSize: "12px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
      border: `1px solid ${payload[0].fill}`,
      backdropFilter: "blur(6px)",
      zIndex: 100
    }}>
      <div style={{ fontWeight: 800, textTransform: "capitalize", marginBottom: "4px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "4px" }}>
        {data.name}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "15px", marginTop: "4px" }}>
        <span>Terjual:</span>
        <span style={{ fontWeight: 700 }}>{data.qty || 0} pcs</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "15px", color: payload[0].fill }}>
        <span>Porsi:</span>
        <span style={{ fontWeight: 800 }}>{data.value}%</span>
      </div>
    </div>
  );
};

export default function SalesChart() {
  const [salesData, setSalesData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  const getColor = (name) => MENU_COLORS[name.toLowerCase()] || MENU_COLORS.default;

  const fetchChart = useCallback(async () => {
    try {
      const json = await statsAPI.getSalesChart();
      const rawData = (json.success && Array.isArray(json.data) && json.data.length > 0) ? json.data : FALLBACK;
      
      const processedData = rawData.map(item => ({
        ...item,
        color: getColor(item.name)
      })).sort((a, b) => b.value - a.value); // Urutkan dari yang terbesar
      
      setSalesData(processedData);
    } catch {
      setSalesData(FALLBACK.map(item => ({ ...item, color: getColor(item.name) })));
    }
  }, []);

  useEffect(() => {
    fetchChart();
    const id = setInterval(fetchChart, 30000);
    return () => clearInterval(id);
  }, [fetchChart]);

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      padding: "5px"
    }}>
      <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#1E293B", marginBottom: "20px" }}>
        Statistik Penjualan Menu
      </h2>

      <div style={{
        display: "flex",
        flexDirection: "column", // Stack vertikal agar chart di atas, legend lebar di bawah
        alignItems: "center",
        gap: "25px"
      }}>
        
        {/* Chart Area */}
        <div style={{ width: "220px", height: "220px", position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={salesData}
                cx="50%" cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
                animationDuration={1000}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {salesData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    style={{
                      filter: activeIndex === index ? 'brightness(1.1) drop-shadow(0px 0px 8px rgba(0,0,0,0.1))' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: activeIndex === index ? 'scale(1.03)' : 'scale(1)',
                      transformOrigin: 'center'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Info */}
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            textAlign: "center", pointerEvents: "none"
          }}>
            <div style={{ fontSize: "12px", color: "#64748B", fontWeight: 500 }}>Total</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#1E293B" }}>
              {salesData.reduce((a, b) => a + (b.qty || 0), 0)}
            </div>
          </div>
        </div>

        {/* Legend Area - 2 Kolom Grid agar tidak scroll */}
        <div style={{ 
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)", // Membagi legend jadi 2 kolom
          gap: "10px 20px",
          padding: "10px"
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
                padding: "8px 12px",
                borderRadius: "10px",
                background: activeIndex === index ? "#F8FAFC" : "transparent",
                border: activeIndex === index ? "1px solid #E2E8F0" : "1px solid transparent",
                transition: "all 0.2s ease",
                cursor: "pointer"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
                <span style={{
                  width: "12px", height: "12px", borderRadius: "4px",
                  background: item.color, flexShrink: 0,
                  boxShadow: `0 2px 5px ${item.color}66`
                }} />
                <span style={{ 
                  fontSize: "12px", 
                  color: "#334155", 
                  textTransform: "capitalize",
                  whiteSpace: "nowrap",
                  fontWeight: activeIndex === index ? "700" : "500" 
                }}>
                  {item.name}
                </span>
              </div>
              <span style={{ 
                fontSize: "11px", 
                fontWeight: "700", 
                color: activeIndex === index ? item.color : "#94A3B8",
                marginLeft: "8px"
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