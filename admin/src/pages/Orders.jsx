import { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useOrderContext } from '../context/OrderContext.jsx';

const pesananData = [
  { id: 1, meja: 12, menu: "Siomay Udang", waktu: "10:00", status: "Selesai" },
  { id: 2, meja: 10, menu: "Siomay Udang", waktu: "10:05", status: "Menunggu" },
  { id: 3, meja: 2, menu: "Siomay Udang", waktu: "10:05", status: "Diproses" },
  { id: 4, meja: 9, menu: "Siomay Udang", waktu: "10:00", status: "Selesai" },
  { id: 5, meja: 1, menu: "Siomay Udang", waktu: "10:05", status: "Menunggu" },
  { id: 6, meja: 4, menu: "Siomay Udang", waktu: "10:05", status: "Diproses" },
  { id: 7, meja: 5, menu: "Siomay Udang", waktu: "10:00", status: "Selesai" },
  { id: 8, meja: 7, menu: "Siomay Udang", waktu: "10:05", status: "Menunggu" },
  { id: 9, meja: 6, menu: "Siomay Udang", waktu: "10:05", status: "Diproses" },
  { id: 10, meja: 8, menu: "Siomay Udang", waktu: "10:05", status: "Diproses" },
  { id: 11, meja: 3, menu: "Siomay Udang", waktu: "10:10", status: "Selesai" },
  { id: 12, meja: 11, menu: "Siomay Udang", waktu: "10:10", status: "Menunggu" },
  { id: 13, meja: 13, menu: "Siomay Udang", waktu: "10:15", status: "Diproses" },
  { id: 14, meja: 14, menu: "Siomay Udang", waktu: "10:15", status: "Selesai" },
  { id: 15, meja: 15, menu: "Siomay Udang", waktu: "10:20", status: "Menunggu" },
  { id: 16, meja: 16, menu: "Siomay Udang", waktu: "10:20", status: "Diproses" },
  { id: 17, meja: 17, menu: "Siomay Udang", waktu: "10:25", status: "Selesai" },
  { id: 18, meja: 18, menu: "Siomay Udang", waktu: "10:25", status: "Menunggu" },
  { id: 19, meja: 19, menu: "Siomay Udang", waktu: "10:30", status: "Diproses" },
  { id: 20, meja: 20, menu: "Siomay Udang", waktu: "10:30", status: "Selesai" },
  { id: 21, meja: 21, menu: "Siomay Udang", waktu: "10:35", status: "Menunggu" },
  { id: 22, meja: 22, menu: "Siomay Udang", waktu: "10:35", status: "Diproses" },
  { id: 23, meja: 23, menu: "Siomay Udang", waktu: "10:40", status: "Selesai" },
  { id: 24, meja: 24, menu: "Siomay Udang", waktu: "10:40", status: "Menunggu" },
  { id: 25, meja: 25, menu: "Siomay Udang", waktu: "10:45", status: "Diproses" },
  { id: 26, meja: 26, menu: "Siomay Udang", waktu: "10:45", status: "Selesai" },
  { id: 27, meja: 27, menu: "Siomay Udang", waktu: "10:50", status: "Menunggu" },
  { id: 28, meja: 28, menu: "Siomay Udang", waktu: "10:50", status: "Diproses" },
  { id: 29, meja: 29, menu: "Siomay Udang", waktu: "10:55", status: "Selesai" },
  { id: 30, meja: 30, menu: "Siomay Udang", waktu: "10:55", status: "Menunggu" },
];

const TABS = ["Semua Pesanan", "Menunggu", "Diproses", "Selesai"];
const PER_PAGE = 10;

const Orders = () => {
  const navigate = useNavigate();
  const { orders: data, updateOrderStatus, hapusOrder } = useOrderContext();
  const [activeTab, setActiveTab] = useState("Semua Pesanan");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const handleProses = (id) => {
    updateOrderStatus(id, "Selesai");
    setPage(1);
  };

  const handleHapus = (id) => {
    hapusOrder(id);
    setPage(1);
  };

  const filtered = data.filter((p) => {
    const matchTab = activeTab === "Semua Pesanan" || p.status === activeTab;
    const matchSearch = p.menu.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const getAksi = (item) => {
    const btnClass = "text-[11px] rounded-lg font-semibold w-20 py-1 text-center px-2 transition-all";
    if (item.status === "Menunggu") {
      return <button className={`bg-blue-500 text-white ${btnClass}`} onClick={() => navigate(`/admin/detail?id=${item.id}`)}>Detail</button>;
    }
    if (item.status === "Diproses") {
      return <button className={`bg-yellow-500 text-white ${btnClass}`} onClick={() => handleProses(item.id)}>Proses</button>;
    }
    if (item.status === "Selesai") {
      return <button className={`bg-red-500 text-white ${btnClass}`} onClick={() => handleHapus(item.id)}>Hapus</button>;
    }
    return <span>-</span>;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Kelola Pesanan</h1>
          <p className="text-sm font-bold text-gray-400">Semua pesanan pelanggan</p>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="cari pesanan..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-8 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-red-300 w-80 text-gray-600 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-3">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            className={`pb-2 text-sm font-semibold transition-colors ${
              activeTab === tab
                ? "text-red-500 border-b-2 border-red-500"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-gray-100">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#E53E3E] text-white">
              <th className="py-3 px-5 text-left font-semibold">No</th>
              <th className="py-3 px-5 text-left font-semibold">Meja</th>
              <th className="py-3 px-5 text-left font-semibold">Menu Pesanan</th>
              <th className="py-3 px-5 text-left font-semibold">Waktu</th>
              <th className="py-3 px-5 text-left font-semibold">Status</th>
              <th className="py-3 px-5 text-left font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((item, index) => (
              <tr key={item.id} className="bg-pink-50 hover:bg-pink-100">
                <td className="py-3 px-5 font-semibold border-b border-white text-gray-600">{(page - 1) * PER_PAGE + index + 1}</td>
                <td className="py-3 px-5 font-semibold border-b border-white text-gray-600">{item.meja}</td>
                <td className="py-3 px-5 font-semibold border-b border-white text-gray-600">{item.menu}</td>
                <td className="py-3 px-5 font-semibold border-b border-white text-gray-600">{item.waktu}</td>
                <td className="py-3 px-5 font-semibold border-b border-white text-gray-600">{item.status}</td>
                <td className="py-3 px-5 border-b border-white">{getAksi(item)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end mt-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            className="w-8 h-8 flex items-center justify-center text-sm text-gray-400 border border-gray-200 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
            disabled={page === 1}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 flex items-center justify-center text-sm rounded-md border transition-colors ${
                page === p
                  ? "border-gray-400 bg-gray-200 text-gray-900 font-semibold"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            className="w-8 h-8 flex items-center justify-center text-sm text-gray-400 border border-gray-200 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
            disabled={page === totalPages}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default Orders;

