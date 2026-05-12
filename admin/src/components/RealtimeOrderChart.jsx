import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const RealtimeOrderChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndFetchData = () => {
      const savedData = localStorage.getItem("weekly_stats_data");
      const lastReset = localStorage.getItem("last_stats_reset");
      const now = new Date();

      const isExpired = lastReset && (now.getTime() - parseInt(lastReset) > 604800000);

      if (!savedData || isExpired) {
        const defaultData = [
          { name: "Senin", orders: 20 },
          { name: "Selasa", orders: 35 },
          { name: "Rabu", orders: 15 },
          { name: "Kamis", orders: 28 },
          { name: "Jumat", orders: 42 },
          { name: "Sabtu", orders: 10 },
          { name: "Minggu", orders: 20 },
        ];
        
        setData(defaultData);
        localStorage.setItem("weekly_stats_data", JSON.stringify(defaultData));
        localStorage.setItem("last_stats_reset", now.getTime().toString());
      } else {
        setData(JSON.parse(savedData));
      }
      setLoading(false);
    };

    checkAndFetchData();
  }, []);

  if (loading) return <div className="h-[350px] animate-pulse bg-gray-50 rounded-[24px]" />;

  return (
    <div className="bg-white p-8 rounded-[24px] shadow-[0_12px_26px_rgba(15,23,42,0.05)] border border-gray-50 w-full overflow-hidden">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-[#1A202C] font-extrabold text-xl">Grafik Pesanan Mingguan</h2>
          <p className="text-gray-400 text-sm font-medium mt-1 leading-relaxed">
            Data akan di-reset setiap 7 hari otomatis
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-[#F0FDF4] px-4 py-2 rounded-full border border-[#DCFCE7] shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse"></span>
          <span className="text-[#166534] text-[10px] font-black uppercase tracking-wider">Terhubung</span>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {/* PERBAIKAN: Margin bottom ditambah agar teks hari tidak kepotong */}
          <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              // PERBAIKAN: interval 0 memaksa semua label hari muncul
              interval={0} 
              tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 600 }}
              // PERBAIKAN: dy (jarak vertikal) disesuaikan
              dy={15} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              ticks={[0, 15, 30, 45, 60]}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              content={<CustomTooltip />}
            />
            <Bar dataKey="orders" radius={[4, 4, 0, 0]} barSize={12}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.orders >= 45 ? "#4A5568" : "#E2E8F0"} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-xl border-none">
        {`${payload[0].value} Pesanan`}
      </div>
    );
  }
  return null;
};

export default RealtimeOrderChart;