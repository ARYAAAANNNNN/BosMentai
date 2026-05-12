import { useState, useEffect } from 'react';
// Perbaikan: "lucide-center" diubah menjadi "lucide-react"
import { Search, X, CheckCircle, Clock, ChefHat, CircleCheck, Trash2, Eye, Loader2, Printer } from 'lucide-react';
import { useOrderContext } from '../context/OrderContext.jsx';

// --- Konfigurasi Status ---
const STATUS_CONFIG = {
  'Menunggu Konfirmasi': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'Menunggu Konfirmasi' },
  'Terkonfirmasi':      { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle, label: 'Terkonfirmasi' },
  'Diproses':           { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: ChefHat, label: 'Diproses' },
  'Selesai':            { color: 'bg-green-100 text-green-700 border-green-200', icon: CircleCheck, label: 'Selesai' },
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
  const bg = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500', warning: 'bg-yellow-500 text-yellow-900' };
  return (
    <div className="fixed top-6 right-6 z-[200] animate-in slide-in-from-right duration-300">
      <div className={`${bg[type] || bg.success} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 min-w-[260px]`}>
        <CheckCircle size={16} className="shrink-0" />
        <span className="text-sm font-semibold flex-1">{message}</span>
        <button onClick={onClose} className="opacity-70 hover:opacity-100"><X size={14} /></button>
      </div>
    </div>
  );
};

const DetailModal = ({ order, onClose, onProcess, loadingAction }) => {
  if (!order) return null;
  const [isPrinting, setIsPrinting] = useState(false);

  const subtotal = order.total_harga || order.items?.reduce((s, i) => s + (i.harga || 0) * (i.qty || 0), 0) || 0;
  const tax = subtotal * 0.1;
  const grandTotal = subtotal + tax;

  const handlePrintAction = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
      if (order.status === 'Terkonfirmasi') onProcess(order.id);
    }, 500);
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
            <button onClick={handlePrintAction} disabled={isPrinting} className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition-all active:scale-95">
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
    const base = "w-full py-2 px-3 rounded-lg font-bold text-[11px] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50";
    if (item.status === 'Menunggu Konfirmasi') return <button onClick={() => handleUpdateStatus(item.id, 'Terkonfirmasi', 'Pesanan dikonfirmasi!')} className={`${base} bg-green-500 text-white hover:bg-green-600`}>{loadingAction === item.id ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle size={14}/>} Konfirmasi</button>;
    if (item.status === 'Terkonfirmasi') return <button onClick={() => setDetailOrder(item)} className={`${base} bg-blue-500 text-white hover:bg-blue-600`}><Eye size={14}/> Detail & Cetak</button>;
    if (item.status === 'Diproses') return <button onClick={() => handleUpdateStatus(item.id, 'Selesai', 'Pesanan Selesai!')} className={`${base} bg-orange-500 text-white hover:bg-orange-600`}>{loadingAction === item.id ? <Loader2 size={14} className="animate-spin"/> : <CircleCheck size={14}/>} Selesaikan</button>;
    if (item.status === 'Selesai') return <button onClick={async () => { if(confirm('Hapus history?')) { await hapusOrder(item.id); showToast('History dihapus', 'warning'); } }} className={`${base} bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600`}>Hapus</button>;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen print:p-0 print:bg-white">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {detailOrder && (
        <div id="thermal-struk" className="hidden print:block font-mono text-black bg-white mx-auto">
          <div className="text-center">
            <p className="text-[8pt]">==========================</p>
            <h1 className="text-[11pt] font-black leading-none mb-1">BOS MENTAI</h1>
            <p className="text-[8pt] font-bold">QR SMARTORDER</p>
            <p className="text-[8pt]">==========================</p>
          </div>

          <div className="text-[7.5pt] mt-2 space-y-0.5">
            <div className="flex justify-between"><span>No: ORD-{detailOrder.id}</span><span>Meja: {detailOrder.meja}</span></div>
            <div className="flex justify-between"><span>{new Date().toLocaleDateString('id-ID')}</span><span>{detailOrder.waktu}</span></div>
          </div>

          <div className="text-[8pt] mt-1">--------------------------</div>
          <div className="text-center font-bold text-[7.5pt] py-0.5">DETAIL PESANAN</div>
          <div className="text-[8pt]">--------------------------</div>

          <div className="mt-1 space-y-1">
            {detailOrder.items?.map((item, idx) => (
              <div key={idx} className="text-[7.5pt]">
                <div className="flex justify-between">
                   <span className="capitalize truncate max-w-[100px]">{(item.name || item.nama_menu).toLowerCase()}</span>
                   <span className="font-bold">Rp {(item.qty * (item.harga || 0)).toLocaleString('id-ID')}</span>
                </div>
                <div className="text-[7pt] text-gray-600 leading-none italic">{item.qty} x Rp {(item.harga || 0).toLocaleString('id-ID')}</div>
              </div>
            ))}
          </div>

          <div className="text-[8pt] mt-2">--------------------------</div>
          <div className="text-[7.5pt] space-y-0.5">
            <div className="flex justify-between font-black text-[9pt] pt-1 uppercase">
              <span>Total Bayar</span>
              <span>Rp {( (detailOrder?.total_harga || detailOrder?.items?.reduce((s, i) => s + (i.harga || 0) * (i.qty || 0), 0)) * 1.1 ).toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="text-center mt-3">
            <p className="text-[8pt]">==========================</p>
            <p className="text-[7.5pt] font-bold">Terima Kasih</p>
            <p className="text-[8pt]">==========================</p>
          </div>
        </div>
      )}

      {detailOrder && <DetailModal order={detailOrder} onClose={() => setDetailOrder(null)} onProcess={(id) => handleUpdateStatus(id, 'Diproses', 'Pesanan diproses!')} loadingAction={loadingAction} />}

      <div className="print:hidden">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div><h1 className="text-2xl font-black text-gray-800">Daftar Pesanan</h1><p className="text-sm text-gray-400 font-medium">Monitoring pesanan masuk</p></div>
          <div className="relative group"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={16}/><input type="text" placeholder="Cari meja..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm w-full md:w-64 outline-none focus:ring-2 focus:ring-red-100 transition-all" /></div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {TABS.map(tab => (
            <button key={tab} onClick={() => {setActiveTab(tab); setPage(1);}} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-red-500 text-white shadow-lg shadow-red-100' : 'bg-white text-gray-400 hover:bg-gray-100'}`}>
              {tab} {counts[tab] > 0 && <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === tab ? 'bg-white/20' : 'bg-gray-100'}`}>{counts[tab]}</span>}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">
                  <th className="px-6 py-4 w-16 text-center">Meja</th>
                  <th className="px-6 py-4">Pesanan Utama</th>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-center"><span className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 rounded-xl font-black text-base">{item.meja}</span></td>
                    <td className="px-6 py-4 font-bold text-gray-700">{item.menu || item.items?.[0]?.name || '-'}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{item.waktu}</td>
                    <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-6 py-4 text-right w-48">{renderActionBtn(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 0; size: 58mm auto; }
          body { background: white !important; margin: 0; padding: 0; }
          body * { visibility: hidden; }
          #thermal-struk, #thermal-struk * { visibility: visible; }
          #thermal-struk { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 52mm;
            padding: 2mm 1mm;
            display: block !important; 
          }
        }
      `}</style>
    </div>
  );
};

export default Orders;