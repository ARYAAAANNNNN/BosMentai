import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { laporanAPI } from "../services/api";

const RealtimeOrderChart = ({ data: propsData }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(!propsData);

  // Sinkronisasi data dari props jika dikirim oleh Dashboard.jsx
  useEffect(() => {
    if (propsData && propsData.length > 0) {
      // Normalisasi format: pastikan ada property 'name' dan 'orders'
      const normalized = propsData.map(item => ({
        name: item.label || item.name,
        orders: Number(item.value || item.orders || 0)
      }));
      setData(normalized);
      setLoading(false);
    }
  }, [propsData]);

  // Fungsi Fetch Data Riil dari Backend (hanya jika propsData tidak ada)
  const fetchChartData = useCallback(async () => {
    if (propsData) return; // Prioritaskan data dari props
    
    try {
      const res = await laporanAPI.getChart();
      if (res) {
        const formatted = res.map((item) => ({
          name: item.hari,
          orders: parseInt(item.total || 0),
        }));
        setData(formatted);
      }
    } catch (err) {
      console.warn("Gagal mengambil data chart riil, menggunakan fallback.");
      setData([
        { name: "Senin", orders: 0 },
        { name: "Selasa", orders: 0 },
        { name: "Rabu", orders: 0 },
        { name: "Kamis", orders: 0 },
        { name: "Jumat", orders: 0 },
        { name: "Sabtu", orders: 0 },
        { name: "Minggu", orders: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  }, [propsData]);

  useEffect(() => {
    if (!propsData) {
      fetchChartData();
      const interval = setInterval(fetchChartData, 10000);
      return () => clearInterval(interval);
    }
  }, [fetchChartData, propsData]);

  if (loading) return <SkeletonLoading />;

  return (
    <div className="bg-white p-6 rounded-[24px] shadow-[0_12px_26px_rgba(15,23,42,0.05)] border border-gray-50 w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-gray-900 font-extrabold text-base">Grafik Pesanan Mingguan</h3>
          <p className="text-gray-400 text-[11px] font-semibold mt-1">Data terupdate dari sistem</p>
        </div>
        
        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-green-600 text-[10px] font-black uppercase tracking-wider">Terhubung</span>
        </div>
      </div>

      <div className="h-[230px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
            barCategoryGap="20%"
          >
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
              content={<CustomTooltip />}
            />
            <Bar 
              dataKey="orders" 
              radius={[4, 4, 4, 4]} 
              barSize={12} // Ketebalan batang dikunci agar tidak beda-beda
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  // Batang otomatis gelap jika pesanan tinggi (riil dari DB)
                  fill={entry.orders > 50 ? "#4B5563" : "#E5E7EB"} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Komponen Tooltip Custom
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl text-[10px] font-bold">
        {`${payload[0].value} Pesanan`}
      </div>
    );
  }
  return null;
};

// Komponen Loading
const SkeletonLoading = () => (
  <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 w-full h-[320px] animate-pulse">
    <div className="flex justify-between items-center mb-8">
      <div className="space-y-2">
        <div className="h-4 w-32 bg-gray-100 rounded"></div>
        <div className="h-3 w-24 bg-gray-50 rounded"></div>
      </div>
      <div className="h-6 w-20 bg-green-50 rounded-full"></div>
    </div>
    <div className="h-[180px] bg-gray-50 rounded-xl mt-4"></div>
  </div>
);

export default RealtimeOrderChart;