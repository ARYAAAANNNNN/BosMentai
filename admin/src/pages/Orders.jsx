import { useState, useEffect } from 'react';
import { 
  Search, X, CheckCircle, ChefHat, Printer, 
  Trash2, ChevronLeft, ChevronRight, Check, Clock 
} from 'lucide-react';
import { useOrderContext } from '../context/OrderContext.jsx';

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
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatRelativeTime = (rawTimestamp) => {
    if (!rawTimestamp) return '-';
    try {
      const orderDate = new Date(rawTimestamp);
      const nowJakarta = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      const orderJakarta = new Date(orderDate.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      const diffInMs = nowJakarta - orderJakarta;
      const diffInSecs = Math.floor(diffInMs / 1000);
      const diffInMins = Math.floor(diffInSecs / 60);
      if (diffInSecs < 60) return 'Baru saja';
      if (diffInMins < 60) return `${diffInMins} menit yang lalu`;
      return `${Math.floor(diffInMins / 60)} jam yang lalu`;
    } catch (e) { return '-'; }
  };

  const filtered = data.filter(p => {
    const matchTab = activeTab === 'Semua' || p.status === activeTab;
    const menuName = (p.menu || p.items?.[0]?.name || '').toLowerCase();
    return matchTab && (menuName.includes(search.toLowerCase()) || String(p.meja).includes(search));
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getItemPrice = (item) => item.harga || item.harga_satuan || 0;

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen font-sans print:bg-white print:p-0">
      
      {/* ─── THERMAL STRUK (FIXED TABLE VERSION) ─── */}
      <div id="thermal-struk" className="hidden print:block" style={{ width: '56mm', margin: '0 auto', color: 'black', fontFamily: 'monospace', fontSize: '10px' }}>
        <div style={{ textAlign: 'center', width: '100%' }}>
          <p style={{ margin: '0', whiteSpace: 'nowrap' }}>==============================</p>
          <p style={{ margin: '2px 0', fontWeight: 'bold', fontSize: '12px' }}>BOS MENTAI</p>
          <p style={{ margin: '0', fontWeight: 'bold' }}>QR SMARTORDER</p>
          <p style={{ margin: '0', whiteSpace: 'nowrap' }}>==============================</p>
        </div>

        <table style={{ width: '100%', marginTop: '8px', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ width: '22mm' }}>No Pesanan</td>
              <td>: ORD-{detailOrder?.id?.toString().slice(-4) || '1024'}</td>
            </tr>
            <tr>
              <td>Meja</td>
              <td>: {detailOrder?.meja}</td>
            </tr>
            <tr>
              <td>Tanggal</td>
              <td>: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            </tr>
            <tr>
              <td>Waktu</td>
              <td>: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <p style={{ margin: '0', whiteSpace: 'nowrap' }}>------------------------------</p>
          <p style={{ margin: '2px 0', fontWeight: 'bold' }}>DETAIL PESANAN</p>
          <p style={{ margin: '0', whiteSpace: 'nowrap' }}>------------------------------</p>
        </div>

        <table style={{ width: '100%', marginTop: '4px', borderCollapse: 'collapse' }}>
          <tbody>
            {detailOrder?.items?.map((item, idx) => (
              <tr key={idx}>
                <td style={{ paddingBottom: '6px', verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{item.name || item.nama_menu}</div>
                  <div style={{ fontSize: '9px' }}>x{item.qty}</div>
                </td>
                <td style={{ textAlign: 'right', verticalAlign: 'top', fontWeight: 'bold' }}>
                  Rp {(item.qty * getItemPrice(item)).toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '2px' }}>
          <p style={{ margin: '0', whiteSpace: 'nowrap' }}>------------------------------</p>
          <table style={{ width: '100%', fontWeight: 'bold' }}>
            <tbody>
              <tr>
                <td>Total Item</td>
                <td style={{ textAlign: 'right' }}>{detailOrder?.items?.reduce((a, b) => a + b.qty, 0)} Item</td>
              </tr>
            </tbody>
          </table>
          <p style={{ margin: '0', whiteSpace: 'nowrap' }}>------------------------------</p>
        </div>

        <table style={{ width: '100%', fontWeight: 'bold', fontSize: '11px', marginTop: '4px' }}>
          <tbody>
            <tr>
              <td>TOTAL BAYAR</td>
              <td style={{ textAlign: 'right' }}>Rp {detailOrder?.items?.reduce((a, b) => a + (b.qty * getItemPrice(b)), 0).toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <p style={{ margin: '0', whiteSpace: 'nowrap' }}>==============================</p>
          <p style={{ margin: '2px 0', fontWeight: 'bold' }}>Terima kasih telah memesan</p>
          <p style={{ margin: '0', fontWeight: 'bold' }}>DI BOS MENTAI</p>
          <p style={{ margin: '0', whiteSpace: 'nowrap' }}>==============================</p>
        </div>
      </div>

      {/* ─── WEB INTERFACE ─── */}
      <div className="flex justify-between items-start mb-8 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Pesanan</h1>
          <p className="text-gray-500 text-sm">Monitor semua pesanan yang masuk secara real-time.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
          <input 
            type="text" placeholder="Cari meja..." value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-10 pr-4 py-2 w-80 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none shadow-sm focus:border-[#D04040]"
          />
        </div>
      </div>

      <div className="flex gap-8 border-b border-gray-200 mb-6 print:hidden overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button 
            key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            className={`pb-4 text-sm font-semibold transition-all border-b-2 ${activeTab === tab ? 'text-[#D04040] border-[#D04040]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden print:hidden border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-[#D04040] text-white">
              <th className="px-6 py-4 text-center w-16 font-semibold">No</th>
              <th className="px-6 py-4 text-center font-semibold">Meja</th>
              <th className="px-6 py-4 font-semibold">Menu Pesanan</th>
              <th className="px-6 py-4 text-center font-semibold">Item</th>
              <th className="px-6 py-4 font-semibold">Waktu</th>
              <th className="px-6 py-4 text-center font-semibold">Status</th>
              <th className="px-6 py-4 text-center font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentItems.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-center text-gray-400">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td className="px-6 py-4 text-center font-bold text-gray-700">{item.meja}</td>
                <td className="px-6 py-4 font-medium text-gray-800">{item.items?.length > 1 ? `${item.items[0].name} ... (+${item.items.length - 1})` : (item.menu || item.items?.[0]?.name)}</td>
                <td className="px-6 py-4 text-center font-bold text-gray-700">{item.items?.reduce((a, b) => a + b.qty, 0) || 0}</td>
                <td className="px-6 py-4 text-gray-500 font-medium"><Clock size={14} className="inline mr-1 opacity-40" />{formatRelativeTime(item.createdAt || item.created_at)}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold inline-block min-w-[120px] ${item.status === 'Selesai' ? 'text-gray-400 border border-gray-100' : (STATUS_CONFIG[item.status]?.color || 'bg-gray-100 text-gray-500')}`}>
                    {item.status === 'Selesai' ? '-' : (STATUS_CONFIG[item.status]?.label || item.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    {item.status === 'Menunggu Konfirmasi' && (
                      <button onClick={() => setDetailOrder(item)} className="bg-[#5694D2] text-white px-4 py-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold active:scale-95 transition-transform"><Check size={14}/> Konfirmasi</button>
                    )}
                    {item.status === 'Terkonfirmasi' && (
                      <button onClick={() => updateOrderStatus(item.id, 'Diproses')} className="bg-[#F59E0B] text-white px-4 py-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold active:scale-95 transition-transform"><ChefHat size={14}/> Proses</button>
                    )}
                    {item.status === 'Diproses' && (
                      <button onClick={() => updateOrderStatus(item.id, 'Selesai')} className="bg-[#10B981] text-white px-4 py-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold active:scale-95 transition-transform"><CheckCircle size={14}/> Selesai</button>
                    )}
                    {item.status === 'Selesai' && (
                      <button onClick={() => hapusOrder(item.id)} className="bg-[#EF4444] text-white px-4 py-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold active:scale-95 transition-transform"><Trash2 size={14}/> Hapus</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL PREVIEW */}
      {detailOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="font-bold text-xl text-gray-800">Preview Struk Meja {detailOrder.meja}</h2>
              <button onClick={() => setDetailOrder(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400"/></button>
            </div>
            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {detailOrder.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{item.qty}x {item.name || item.nama_menu}</span>
                    <span className="text-xs text-gray-400 font-medium">Rp {getItemPrice(item).toLocaleString('id-ID')}</span>
                  </div>
                  <span className="font-black text-[#D04040]">Rp {(item.qty * getItemPrice(item)).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
            <div className="p-6 bg-gray-50 border-t">
              <button 
                onClick={() => {
                  setTimeout(() => {
                    window.print();
                    updateOrderStatus(detailOrder.id, 'Terkonfirmasi');
                    setDetailOrder(null);
                  }, 200);
                }}
                className="w-full bg-[#D04040] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg"
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
          #thermal-struk { 
            position: absolute; 
            left: 0;
            top: 0;
            width: 56mm; 
          }
          @page { size: 58mm auto; margin: 0; }
        }
      `}</style>
    </div>
  );
};

export default Orders;