import React from "react";
import { 
  LayoutGrid, 
  ClipboardList, 
  UtensilsCrossed, 
  BarChart3, 
  UserCircle, 
  LogOut,
  Search
} from "lucide-react";

const LaporanPenjualan = () => {
  const tableData = Array(8).fill({
    tanggal: "06/10/2025",
    jumlahPesanan: 120,
    jumlahItem: 120
  });

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-[#333] font-sans">
      {/* --- SIDEBAR --- */}
      <div className="w-60 bg-white border-r border-gray-200 flex flex-col p-6 sticky top-0 h-screen">
        <div className="mb-10 px-2">
          <h1 className="text-xl font-extrabold tracking-tight">
            BosMentai<span className="text-[#D14343]">.</span>
          </h1>
        </div>

        <nav className="flex-1 space-y-1">
          <SideItem icon={<LayoutGrid size={18} />} label="Beranda" />
          <SideItem icon={<ClipboardList size={18} />} label="Kelola Pesanan" />
          <SideItem icon={<UtensilsCrossed size={18} />} label="Kelola Menu" />
          <SideItem icon={<BarChart3 size={18} />} label="Laporan Penjualan" active />
        </nav>

        <div className="pt-10 border-t border-gray-100 space-y-1">
          <SideItem icon={<UserCircle size={18} />} label="Beralih ke user" />
          <SideItem icon={<LogOut size={18} />} label="Logout" />
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 p-10 overflow-y-auto">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-[22px] font-bold text-gray-900">Laporan Penjualan</h2>
            <p className="text-sm text-gray-500 mt-1">Atur menu restoran dan stok</p>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="cari menu..." 
              className="w-72 pl-4 pr-10 py-2 bg-white rounded-full text-xs border border-gray-50 focus:outline-none shadow-sm placeholder-gray-300"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex gap-5 mb-10">
          <div className="w-44 py-2.5 bg-[#F8EDED] border border-[#F2DEDE] rounded-lg text-center text-sm font-medium text-gray-700">
            10/10/2025
          </div>
          <div className="w-44 py-2.5 bg-[#F8EDED] border border-[#F2DEDE] rounded-lg text-center text-sm font-medium text-gray-700">
            13/10/2025
          </div>
          <button className="px-10 py-2.5 bg-[#D14343] hover:bg-[#b93a3a] text-white rounded-lg text-sm font-semibold shadow-sm transition-all">
            Tampilkan
          </button>
        </div>

        {/* 4 Cards Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <CardStat title="Total Pesanan" value="125" desc="pesanan masuk" color="bg-[#D14343]" />
          <CardStat title="Total Menu Terjual" value="64" desc="porsi terjual" color="bg-[#D4A358]" />
          <CardStat title="Pesanan Diproses" value="958" desc="sedang dibuat dapur" color="bg-[#FF3B30]" />
          <CardStat title="Menu Terlaris" value="Siomai Udang" desc="paling banyak dipesan" color="bg-[#82AC61]" />
        </div>

        {/* Chart & Recent List */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="col-span-2 bg-white p-7 rounded-[25px] shadow-sm border border-gray-50">
            <h3 className="text-sm font-bold mb-8">Grafik Jumlah Pesanan</h3>
            <div className="h-44 flex flex-col justify-between relative">
              {/* Mock Chart Lines */}
              <div className="border-b border-dashed border-gray-200 w-full h-0"></div>
              <div className="border-b border-dashed border-gray-200 w-full h-0"></div>
              <div className="border-b border-dashed border-gray-200 w-full h-0"></div>
              <div className="border-b border-dashed border-gray-200 w-full h-0"></div>
              {/* Labels */}
              <div className="flex justify-between px-10 mt-4 text-[10px] text-gray-400 font-medium">
                <span>senin</span>
                <span>selasa</span>
                <span>rabu</span>
                <span>kamis</span>
                <span>jum'at</span>
              </div>
              {/* Curve Line Overlay (SVG) */}
              <svg className="absolute top-0 left-0 w-full h-full overflow-visible">
                <path d="M 50 120 Q 150 50 250 100 T 450 80 T 650 90" fill="none" stroke="#69B3AC" strokeWidth="3" opacity="0.8" />
              </svg>
            </div>
          </div>

          <div className="bg-white p-7 rounded-[25px] shadow-sm border border-gray-50">
            <h3 className="text-sm font-bold mb-6">Pesanan Terbaru</h3>
            <div className="space-y-5">
              <ListItem name="Dimsum Siomay" qty="120x" />
              <ListItem name="Hakau" qty="95x" />
              <ListItem name="Xiao Long Bao" qty="80x" />
              <ListItem name="Dimsum Ayam" qty="80x" />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-[25px] shadow-sm overflow-hidden mb-8 border border-gray-50">
          <table className="w-full text-center">
            <thead>
              <tr className="bg-[#D14343] text-white">
                <th className="py-4 text-xs font-semibold uppercase tracking-wider">Tanggal</th>
                <th className="py-4 text-xs font-semibold uppercase tracking-wider">Jumlah Pesanan</th>
                <th className="py-4 text-xs font-semibold uppercase tracking-wider">Jumlah Item</th>
              </tr>
            </thead>
            <tbody className="bg-[#F8EDED]/40">
              {tableData.map((row, idx) => (
                <tr key={idx} className="border-b border-white/50 last:border-0 text-xs text-gray-600">
                  <td className="py-4">{row.tanggal}</td>
                  <td className="py-4">{row.jumlahPesanan}</td>
                  <td className="py-4">{row.jumlahItem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-5">
          <button className="bg-[#82AC61] hover:bg-[#729853] text-white px-10 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm">
            Export Excel
          </button>
          <button className="bg-[#D14343] hover:bg-[#b93a3a] text-white px-10 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm">
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};

/* --- MINI COMPONENTS UNTUK KERAPIHAN --- */

const SideItem = ({ icon, label, active = false }) => (
  <div className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${
    active 
    ? "bg-[#D14343] text-white rounded-xl shadow-md" 
    : "text-gray-500 hover:text-gray-800"
  }`}>
    {icon}
    <span className="text-[13px] font-semibold">{label}</span>
  </div>
);

const CardStat = ({ title, value, desc, color }) => (
  <div className={`${color} p-5 rounded-[18px] text-white shadow-sm`}>
    <p className="text-[10px] font-light opacity-90 mb-1">{title}</p>
    <h4 className="text-xl font-bold mb-2 tracking-tight">{value}</h4>
    <div className="w-full h-[0.5px] bg-white/30 mb-2"></div>
    <p className="text-[9px] italic opacity-80">{desc}</p>
  </div>
);

const ListItem = ({ name, qty }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
      <span className="text-xs font-bold text-gray-700">{name}</span>
    </div>
    <span className="text-xs font-bold text-gray-500">{qty}</span>
  </div>
);

export default LaporanPenjualan;