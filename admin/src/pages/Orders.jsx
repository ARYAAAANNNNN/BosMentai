import { useState, useEffect } from 'react';
import { Search, X, CheckCircle, Clock, ChefHat, CircleCheck, Trash2, Eye, Loader2, Printer } from 'lucide-react';
import { useOrderContext } from '../context/OrderContext.jsx';

const STATUS_CONFIG = {
  'Menunggu Konfirmasi': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'Menunggu Konfirmasi' },
  'Terkonfirmasi': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle, label: 'Terkonfirmasi' },
  'Diproses': { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: ChefHat, label: 'Diproses' },
  'Selesai': { color: 'bg-green-100 text-green-700 border-green-200', icon: CircleCheck, label: 'Selesai' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { color: 'bg-gray-100 text-gray-500 border-gray-200', label: status };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

const TABS = ['Semua', 'Menunggu Konfirmasi', 'Terkonfirmasi', 'Diproses', 'Selesai'];
const PER_PAGE = 10;

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const bg = { success: 'bg-green-500', error: 'bg-red-500' };
  return (
    <div className="fixed top-6 right-6 z-[200] animate-in slide-in-from-right">
      <div className={`${bg[type] || bg.success} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2`}>
        <CheckCircle size={16} />
        <span className="text-sm font-semibold">{message}</span>
      </div>
    </div>
  );
};

const DetailModal = ({ order, onClose, onProcess }) => {
  if (!order) return null;
  const [isPrinting, setIsPrinting] = useState(false);

  const subtotal = order.total_harga || order.items?.reduce((s, i) => s + (i.harga || 0) * (i.qty || 0), 0) || 0;
  const tax = subtotal * 0.1;
  const grandTotal = subtotal + tax;

  const handlePrintAction = () => {
    setIsPrinting(true);
    // Timeout memberikan waktu DOM print-struk merender data terbaru
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
      if (order.status === 'Terkonfirmasi') onProcess(order.id);
    }, 800);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] print:hidden" onClick={onClose} />
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 print:hidden">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Detail Pesanan #{order.id}</h2>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={16}/></button>
          </div>
          <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-50 p-3 rounded-2xl border border-red-100">
                <span className="text-[10px] uppercase font-bold text-red-400">Meja</span>
                <p className="text-2xl font-black text-red-600">{order.meja}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <span className="text-[10px] uppercase font-bold text-gray-400">Total</span>
                <p className="text-lg font-bold text-gray-800">Rp {grandTotal.toLocaleString('id-ID')}</p>
              </div>
            </div>
            <div className="space-y-2">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-600">{item.qty}x {item.name || item.nama_menu}</span>
                  <span className="font-bold">Rp {(item.qty * (item.harga || 0)).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-5 bg-gray-50 border-t">
            <button onClick={handlePrintAction} disabled={isPrinting} className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
              {isPrinting ? <Loader2 className="animate-spin" size={20}/> : <Printer size={20}/>}
              {order.status === 'Terkonfirmasi' ? 'Cetak & Proses' : 'Cetak Ulang'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const Orders = () => {
  const { orders: data = [], updateOrderStatus, hapusOrder } = useOrderContext();
  const [activeTab, setActiveTab] = useState('Semua');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [detailOrder, setDetailOrder] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleUpdateStatus = async (id, status, msg) => {
    setLoadingAction(id);
    const res = await updateOrderStatus(id, status);
    setLoadingAction(null);
    if (res?.success) {
      showToast(msg);
      if (status === 'Diproses') setDetailOrder(null);
    }
  };

  const filtered = data.filter(p => {
    const matchTab = activeTab === 'Semua' || p.status === activeTab;
    const matchSearch = (p.menu || p.items?.[0]?.name || '').toLowerCase().includes(search.toLowerCase()) || String(p.meja).includes(search);
    return matchTab && matchSearch;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const counts = data.reduce((acc, curr) => { acc[curr.status] = (acc[curr.status] || 0) + 1; return acc; }, {});

  const renderActionBtn = (item) => {
    const base = "w-full py-2 px-3 rounded-lg font-bold text-[11px] flex items-center justify-center gap-2 transition-all active:scale-95";
    if (item.status === 'Menunggu Konfirmasi') return <button onClick={() => handleUpdateStatus(item.id, 'Terkonfirmasi', 'Dikonfirmasi!')} className={`${base} bg-green-500 text-white`}>{loadingAction === item.id ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle size={14}/>} Konfirmasi</button>;
    if (item.status === 'Terkonfirmasi') return <button onClick={() => setDetailOrder(item)} className={`${base} bg-blue-500 text-white`}><Eye size={14}/> Detail & Cetak</button>;
    if (item.status === 'Diproses') return <button onClick={() => handleUpdateStatus(item.id, 'Selesai', 'Selesai!')} className={`${base} bg-orange-500 text-white`}><CircleCheck size={14}/> Selesaikan</button>;
    if (item.status === 'Selesai') return <button onClick={() => confirm('Hapus history?') && hapusOrder(item.id)} className={`${base} bg-gray-100 text-gray-500 hover:text-red-600`}>Hapus</button>;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen print:p-0 print:bg-white">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* STRUK AREA (VISIBLE ON PRINT ONLY) */}
      <div id="thermal-struk" className="hidden print:block font-mono text-black bg-white mx-auto">
        {detailOrder && (
          <div className="p-1">
            <div className="text-center">
              <p>==========================</p>
              <h1 className="text-lg font-black">BOS MENTAI</h1>
              <p className="text-xs">QR SMARTORDER</p>
              <p>==========================</p>
            </div>
            <div className="text-[10px] mt-2 flex justify-between">
              <span>No: ORD-{detailOrder.id}</span>
              <span>Meja: {detailOrder.meja}</span>
            </div>
            <div className="text-[10px] border-b border-dashed my-2 pb-1">
              {detailOrder.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.qty}x {item.name || item.nama_menu}</span>
                  <span>{(item.qty * (item.harga || 0)).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold">
              <span>Total (+Pajak)</span>
              <span>Rp {((detailOrder.total_harga || 0) * 1.1).toLocaleString('id-ID')}</span>
            </div>
            <div className="text-center mt-4">
              <p>Terima Kasih</p>
              <p>==========================</p>
            </div>
          </div>
        )}
      </div>

      {/* UI UTAMA (HIDDEN ON PRINT) */}
      <div className="print:hidden">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-black text-gray-800">Daftar Pesanan</h1>
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/><input type="text" placeholder="Cari meja..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 pr-4 py-2 bg-white border rounded-xl text-sm" /></div>
        </div>

        <div className="flex gap-2 overflow-x-auto mb-4">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-red-500 text-white' : 'bg-white text-gray-400'}`}>
              {tab} {counts[tab] > 0 && <span className="ml-1 px-1.5 bg-white/20 rounded text-[10px]">{counts[tab]}</span>}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr className="text-gray-400 font-bold text-[11px] uppercase">
                <th className="px-6 py-4 w-16">Meja</th>
                <th className="px-6 py-4">Menu</th>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 font-black">{item.meja}</td>
                  <td className="px-6 py-4 font-bold">{item.menu || item.items?.[0]?.name}</td>
                  <td className="px-6 py-4 text-xs">{item.waktu}</td>
                  <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                  <td className="px-6 py-4 text-right">{renderActionBtn(item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detailOrder && <DetailModal order={detailOrder} onClose={() => setDetailOrder(null)} onProcess={(id) => handleUpdateStatus(id, 'Diproses', 'Diproses!')} />}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #thermal-struk, #thermal-struk * { visibility: visible; }
          #thermal-struk { position: absolute; left: 0; top: 0; width: 58mm; display: block !important; }
          @page { size: 58mm auto; margin: 0; }
        }
      `}</style>
    </div>
  );
};

export default Orders;