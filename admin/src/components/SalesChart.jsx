import React, { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { statsAPI } from "../sevices/api";

const FALLBACK = [
  { name: "Dimsum",    value: 35, color: "#C0534A" },
  { name: "Goreng",    value: 15, color: "#A87060" },
  { name: "Dessert",   value: 10, color: "#E8B8A0" },
  { name: "Minuman",   value: 20, color: "#A8B4BC" },
  { name: "Menu Lain", value: 20, color: "#C4AFA8" },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1A202C", color: "#fff",
      borderRadius: 8, padding: "6px 12px",
      fontSize: 13, fontWeight: 600,
      pointerEvents: "none",
    }}>
      {payload[0].name}: {payload[0].value}%
    </div>
  );
};

export default function SalesChart() {
  const [salesData, setSalesData] = useState(FALLBACK);

  const fetchChart = useCallback(async () => {
    try {
      const json = await statsAPI.getSalesChart();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setSalesData(json.data);
      }
    } catch {
      // silent — gunakan fallback / data sebelumnya
    }
  }, []);

  useEffect(() => {
    fetchChart();
    const id = setInterval(fetchChart, 30_000);
    return () => clearInterval(id);
  }, [fetchChart]);

  return (
    <div style={{
      fontFamily: "'Segoe UI', sans-serif",
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
    }}>

      {/* Header */}
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1A202C", margin: "0 0 0 0", flexShrink: 0 }}>
        Statistik Penjualan Menu
      </h2>

      {/* Chart + Legend */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "row",
        alignItems: "center", justifyContent: "center",
        gap: 24, minHeight: 0,
      }}>

        {/* Donut */}
        <div style={{ width: 155, height: 155, flexShrink: 0 }}>
          <PieChart width={155} height={155}>
            <Pie
              data={salesData}
              cx={75} cy={75}
              innerRadius={42} outerRadius={72}
              paddingAngle={4} dataKey="value"
              startAngle={90} endAngle={-270}
            >
              {salesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
          {salesData.map((item) => (
            <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 12, height: 12, borderRadius: "50%",
                background: item.color, flexShrink: 0,
              }} />
              <span style={{ fontSize: 13, color: "#374151", width: 80 }}>{item.name}</span>
              <span style={{ fontSize: 13, color: "#6B7280", minWidth: 36, textAlign: "right" }}>
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}