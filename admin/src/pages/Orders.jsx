import { useState, useEffect } from 'react';
import { 
  Search, X, CheckCircle, ChefHat, Printer, 
  Trash2, ChevronLeft, ChevronRight, Check, Clock 
} from 'lucide-react';
import { useOrderContext } from '../context/OrderContext.jsx';

// Konfigurasi Warna & Label Status
const STATUS_CONFIG = {
  'Menunggu Konfirmasi': { color: 'bg-[#FEF3C7] text-[#D97706]', label: 'Menunggu konfirmasi' },
  'Terkonfirmasi': { color: 'bg-[#DBEAFE] text-[#2563EB]', label: 'Terkonfirmasi' },
  'Diproses': { color: 'bg-[#FEE2E2] text-[#EF4444]', label: 'Diproses' },
  'Selesai': { color: 'transparent text-gray-400', label: '-' },
};

const TABS = ['Semua', 'Menunggu Konfirmasi', 'Terkonfirmasi', 'Diproses', 'Selesai'];

const Orders = () => {
  const { orders: data = [], updateOrderStatus, hapusOrder } = useOrderContext();
  const [activeTab, setActiveTab] = useState('Semua');
  const [search, setSearch] = useState('');
  const [detailOrder, setDetailOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // ─── LOGIKA REAL-TIME ───────────────────────────────────────────────────
  
  // State 'tick' digunakan hanya untuk memicu render ulang komponen setiap detik
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000); // Update setiap 1 detik
    return () => clearInterval(timer);
  }, []);

  /**
   * Fungsi untuk menghitung selisih waktu secara akurat di zona Asia/Jakarta
   */
  const formatRelativeTime = (rawTimestamp) => {
    if (!rawTimestamp) return '-';

    try {
      const orderDate = new Date(rawTimestamp);
      if (isNaN(orderDate.getTime())) return '-';

      // Paksa perbandingan menggunakan zona Asia/Jakarta
      const nowJakarta = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      const orderJakarta = new Date(orderDate.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));

      const diffInMs = nowJakarta - orderJakarta;
      const diffInSecs = Math.floor(diffInMs / 1000);
      const diffInMins = Math.floor(diffInSecs / 60);
      const diffInHours = Math.floor(diffInMins / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInSecs < 60) return 'Baru saja';
      if (diffInMins < 60) return `${diffInMins} menit yang lalu`;
      if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
      return `${diffInDays} hari yang lalu`;
    } catch (e) {
      return '-';
    }
  };

  // ─── FILTER & PAGINATION ────────────────────────────────────────────────
  
  const filtered = data.filter(p => {
    const matchTab = activeTab === 'Semua' || p.status === activeTab;
    const menuName = (p.menu || p.items?.[0]?.name || '').toLowerCase();
    const matchSearch = menuName.includes(search.toLowerCase()) || String(p.meja).includes(search);
    return matchTab && matchSearch;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getItemPrice = (item) => item.harga || item.harga_satuan || 0;

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen font-sans print:bg-white print:p-0">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Pesanan</h1>
          <p className="text-gray-500 text-sm">Semua pesanan pelanggan masuk ke sini.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
          <input 
            type="text" 
            placeholder="Cari pesanan..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-10 pr-4 py-2 w-80 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none shadow-sm focus:border-[#D04040]"
          />
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex gap-8 border-b border-gray-200 mb-6 print:hidden overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button 
            key={tab} 
            onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            className={`pb-4 text-sm font-semibold transition-all whitespace-nowrap border-b-2 ${
              activeTab === tab 
                ? 'text-[#D04040] border-[#D04040]' 
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden print:hidden border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-[#D04040] text-white">
              <th className="px-6 py-4 font-semibold text-center w-16">No</th>
              <th className="px-6 py-4 font-semibold text-center">Meja</th>
              <th className="px-6 py-4 font-semibold">Menu Pesanan</th>
              <th className="px-6 py-4 font-semibold text-center">Item</th>
              <th className="px-6 py-4 font-semibold">Waktu</th>
              <th className="px-6 py-4 font-semibold text-center">Status</th>
              <th className="px-6 py-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentItems.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-center text-gray-400">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td className="px-6 py-4 text-center font-bold text-gray-700">{item.meja}</td>
                <td className="px-6 py-4 text-gray-700 font-medium">
                  {item.items?.length > 1 
                    ? `${item.items[0].name} ... (+${item.items.length - 1})` 
                    : (item.menu || item.items?.[0]?.name)}
                </td>
                <td className="px-6 py-4 text-center font-bold text-gray-700">
                  {item.items?.reduce((a, b) => a + b.qty, 0) || 0}
                </td>
                
                {/* KOLOM WAKTU REAL-TIME WIB */}
                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-300" />
                    <span className="tabular-nums font-medium">
                      {formatRelativeTime(item.createdAt || item.created_at)}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold inline-block min-w-[120px] text-center ${
                    item.status === 'Selesai' ? 'text-gray-400' : (STATUS_CONFIG[item.status]?.color || 'bg-gray-100 text-gray-500')
                  }`}>
                    {item.status === 'Selesai' ? '-' : (STATUS_CONFIG[item.status]?.label || item.status)}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    {item.status === 'Menunggu Konfirmasi' && (
                      <button onClick={() => setDetailOrder(item)} className="bg-[#5694D2] hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold transition-all active:scale-95">
                        <Check size={14}/> Konfirmasi
                      </button>
                    )}
                    {item.status === 'Terkonfirmasi' && (
                      <button onClick={() => updateOrderStatus(item.id, 'Diproses')} className="bg-[#F59E0B] hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold transition-all active:scale-95">
                        <ChefHat size={14}/> Proses
                      </button>
                    )}
                    {item.status === 'Diproses' && (
                      <button onClick={() => updateOrderStatus(item.id, 'Selesai')} className="bg-[#10B981] hover:bg-green-600 text-white px-4 py-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold transition-all active:scale-95">
                        <CheckCircle size={14}/> Selesai
                      </button>
                    )}
                    {item.status === 'Selesai' && (
                      <button onClick={() => hapusOrder(item.id)} className="bg-[#EF4444] hover:bg-red-600 text-white px-4 py-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold transition-all active:scale-95">
                        <Trash2 size={14}/> Hapus
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="p-2 bg-white border border-gray-100 rounded-xl disabled:opacity-30 shadow-sm"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-500">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="p-2 bg-white border border-gray-100 rounded-xl disabled:opacity-30 shadow-sm"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      )}

      {/* MODAL DETAIL */}
      {detailOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="font-bold text-xl text-gray-800">Pesanan Meja {detailOrder.meja}</h2>
              <button onClick={() => setDetailOrder(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-gray-400"/>
              </button>
            </div>
            
            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {detailOrder.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{item.qty}x {item.name || item.nama_menu}</span>
                    <span className="text-xs text-gray-400">Rp {getItemPrice(item).toLocaleString('id-ID')}</span>
                  </div>
                  <span className="font-black text-[#D04040]">
                    Rp {(item.qty * getItemPrice(item)).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-6 bg-gray-50 border-t">
              <button 
                onClick={() => { 
                  window.print(); 
                  updateOrderStatus(detailOrder.id, 'Terkonfirmasi'); 
                  setDetailOrder(null); 
                }}
                className="w-full bg-[#D04040] hover:bg-red-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3"
              >
                <Printer size={20}/> Cetak & Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @media print {
          body * { visibility: hidden; }
          #thermal-struk, #thermal-struk * { visibility: visible; }
        }
      `}</style>
    </div>
  );
};

export default Orders;