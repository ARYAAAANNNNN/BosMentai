import { useState, useEffect } from 'react';
import { Search, X, CheckCircle, Clock, ChefHat, CircleCheck, Trash2, Eye, Loader2 } from 'lucide-react';
import { useOrderContext } from '../context/OrderContext.jsx';
import { getImageUrl } from '../services/api.js';

// ── Status Config ─────────────────────────────────────────────────
const STATUS_CONFIG = {
  'Menunggu Konfirmasi': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'Menunggu Konfirmasi' },
  'Terkonfirmasi':      { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle, label: 'Terkonfirmasi' },
  'Diproses':           { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: ChefHat, label: 'Diproses' },
  'Selesai':            { color: 'bg-green-100 text-green-700 border-green-200', icon: CircleCheck, label: 'Selesai' },
};

const TABS = ['Semua', 'Menunggu Konfirmasi', 'Terkonfirmasi', 'Diproses', 'Selesai'];
const PER_PAGE = 10;

// ── Toast Component ───────────────────────────────────────────────
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const bg = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500', warning: 'bg-yellow-500 text-yellow-900' };
  return (
    <div className="fixed top-6 right-6 z-[200]" style={{ animation: 'slideIn .3s ease-out' }}>
      <div className={`${bg[type] || bg.success} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 min-w-[260px]`}>
        <CheckCircle size={16} className="shrink-0" />
        <span className="text-sm font-semibold flex-1">{message}</span>
        <button onClick={onClose} className="opacity-70 hover:opacity-100"><X size={14} /></button>
      </div>
    </div>
  );
};

// ── Detail Modal Component ────────────────────────────────────────
const DetailModal = ({ order, onClose, onProcess, loadingAction }) => {
  if (!order) return null;
  const totalHarga = order.total_harga || order.items?.reduce((s, i) => s + (i.harga || 0) * (i.qty || 0), 0) || 0;
  const canProcess = order.status === 'Terkonfirmasi';

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" onClick={onClose} />
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden" style={{ animation: 'scaleIn .25s ease-out' }}>
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Detail Pesanan #{order.id}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Waktu order: {order.waktu || '-'}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Info Cards */}
          <div className="px-6 py-4 flex gap-3">
            <div className="flex-1 bg-[#D04040] text-white rounded-2xl p-4">
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-wider">Meja</p>
              <p className="text-2xl font-black mt-1">{order.meja}</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</p>
              <p className="text-lg font-black text-gray-900 mt-1">Rp {totalHarga.toLocaleString('id-ID')}</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
              <div className="mt-1.5">
                <StatusBadge status={order.status} />
              </div>
            </div>
          </div>

          {/* Catatan */}
          {order.catatan && (
            <div className="px-6 pb-3">
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3">
                <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider mb-1">Catatan</p>
                <p className="text-sm text-yellow-800">{order.catatan}</p>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Daftar Item</p>
            <div className="space-y-2">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#D04040] text-white rounded-lg flex items-center justify-center font-black text-sm">{item.qty}</div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{item.name || item.nama_menu}</p>
                      <p className="text-[11px] text-gray-400">Rp {(item.harga || 0).toLocaleString('id-ID')} /item</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">Rp {((item.harga || 0) * (item.qty || 0)).toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          {canProcess && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => onProcess(order.id)}
                disabled={loadingAction === order.id}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-orange-200"
              >
                {loadingAction === order.id ? <Loader2 size={18} className="animate-spin" /> : <ChefHat size={18} />}
                {loadingAction === order.id ? 'Memproses...' : 'Proses Pesanan'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ── Status Badge ──────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { color: 'bg-gray-100 text-gray-500 border-gray-200', label: status };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

// ══════════════════════════════════════════════════════════════════
// Orders — Main Component
// ══════════════════════════════════════════════════════════════════
const Orders = () => {
  const { orders: data = [], updateOrderStatus, hapusOrder } = useOrderContext();
  const [activeTab, setActiveTab] = useState('Semua');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [detailOrder, setDetailOrder] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // ── Actions ─────────────────────────────────────────────────────
  const handleKonfirmasi = async (id) => {
    setLoadingAction(id);
    const res = await updateOrderStatus(id, 'Terkonfirmasi');
    setLoadingAction(null);
    if (res?.success) showToast('Pesanan dikonfirmasi!', 'success');
    else showToast(res?.message || 'Gagal konfirmasi', 'error');
  };

  const handleProses = async (id) => {
    setLoadingAction(id);
    const res = await updateOrderStatus(id, 'Diproses');
    setLoadingAction(null);
    setDetailOrder(null);
    if (res?.success) showToast('Pesanan sedang diproses!', 'info');
    else showToast(res?.message || 'Gagal proses', 'error');
  };

  const handleSelesai = async (id) => {
    setLoadingAction(id);
    const res = await updateOrderStatus(id, 'Selesai');
    setLoadingAction(null);
    if (res?.success) showToast('Pesanan selesai!', 'success');
    else showToast(res?.message || 'Gagal update', 'error');
  };

  const handleHapus = async (id) => {
    if (!window.confirm('Hapus pesanan ini dari daftar?')) return;
    setLoadingAction(id);
    const res = await hapusOrder(id);
    setLoadingAction(null);
    if (res?.success) showToast('Pesanan dihapus.', 'warning');
    else showToast(res?.message || 'Gagal hapus', 'error');
  };

  const handleDetail = (order) => setDetailOrder(order);

  // ── Filtering ───────────────────────────────────────────────────
  const filtered = (data || []).filter(p => {
    const matchTab = activeTab === 'Semua' || p.status === activeTab;
    const menuName = (p.menu || p.items?.[0]?.name || '').toLowerCase();
    const matchSearch = menuName.includes(search.toLowerCase()) || String(p.meja).includes(search);
    return matchTab && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Count per tab ───────────────────────────────────────────────
  const counts = {};
  (data || []).forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });

  // ── Action Buttons per Status ───────────────────────────────────
  const getActions = (item) => {
    const btnBase = 'text-[11px] rounded-lg font-semibold py-1.5 px-3 transition-all flex items-center justify-center gap-1 disabled:opacity-50 min-w-[80px]';
    const isLoading = loadingAction === item.id;

    if (item.status === 'Menunggu Konfirmasi') {
      return (
        <div className="flex gap-1.5">
          <button className={`bg-green-500 hover:bg-green-600 text-white ${btnBase}`} onClick={() => handleKonfirmasi(item.id)} disabled={isLoading}>
            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <><CheckCircle size={12} /> Konfirmasi</>}
          </button>
          <button className={`bg-blue-500 hover:bg-blue-600 text-white ${btnBase}`} onClick={() => handleDetail(item)}>
            <Eye size={12} /> Detail
          </button>
        </div>
      );
    }
    if (item.status === 'Terkonfirmasi') {
      return (
        <button className={`bg-blue-500 hover:bg-blue-600 text-white ${btnBase}`} onClick={() => handleDetail(item)}>
          <Eye size={12} /> Detail
        </button>
      );
    }
    if (item.status === 'Diproses') {
      return (
        <button className={`bg-green-500 hover:bg-green-600 text-white ${btnBase}`} onClick={() => handleSelesai(item.id)} disabled={isLoading}>
          {isLoading ? <Loader2 size={12} className="animate-spin" /> : <><CircleCheck size={12} /> Selesai</>}
        </button>
      );
    }
    if (item.status === 'Selesai') {
      return (
        <button className={`bg-red-500 hover:bg-red-600 text-white ${btnBase}`} onClick={() => handleHapus(item.id)} disabled={isLoading}>
          {isLoading ? <Loader2 size={12} className="animate-spin" /> : <><Trash2 size={12} /> Hapus</>}
        </button>
      );
    }
    return <span className="text-gray-300">-</span>;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Detail Modal */}
      {detailOrder && (
        <DetailModal order={detailOrder} onClose={() => setDetailOrder(null)} onProcess={handleProses} loadingAction={loadingAction} />
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Kelola Pesanan</h1>
          <p className="text-sm font-bold text-gray-400">Semua pesanan pelanggan • {data.length} total</p>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="cari pesanan..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-8 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-red-300 w-80 text-gray-600 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-4 overflow-x-auto">
        {TABS.map(tab => {
          const count = tab === 'Semua' ? data.length : (counts[tab] || 0);
          return (
            <button key={tab} onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`pb-2.5 px-4 text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400 hover:text-gray-600'
              }`}>
              {tab}
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-gray-100 bg-white">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#E53E3E] text-white">
              <th className="py-3 px-4 text-left font-semibold w-12">No</th>
              <th className="py-3 px-4 text-left font-semibold w-16">Meja</th>
              <th className="py-3 px-4 text-left font-semibold">Menu Pesanan</th>
              <th className="py-3 px-4 text-left font-semibold w-20">Item</th>
              <th className="py-3 px-4 text-left font-semibold w-20">Waktu</th>
              <th className="py-3 px-4 text-left font-semibold w-44">Status</th>
              <th className="py-3 px-4 text-left font-semibold w-52">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={7} className="py-16 text-center text-gray-400 text-sm">Tidak ada pesanan ditemukan</td></tr>
            ) : paginated.map((item, index) => (
              <tr key={item.id} className="bg-white hover:bg-gray-50 transition-colors border-b border-gray-50">
                <td className="py-3 px-4 font-semibold text-gray-500">{(page - 1) * PER_PAGE + index + 1}</td>
                <td className="py-3 px-4">
                  <span className="bg-gray-100 text-gray-700 font-bold text-xs px-2.5 py-1 rounded-lg">{item.meja}</span>
                </td>
                <td className="py-3 px-4 font-semibold text-gray-700 max-w-[200px] truncate">{item.menu || item.items?.[0]?.name || '-'}</td>
                <td className="py-3 px-4 text-gray-500 font-medium">{item.totalItems || item.items?.reduce((s, i) => s + (i.qty || 0), 0) || 0}</td>
                <td className="py-3 px-4 text-gray-500 font-medium">{item.waktu || '-'}</td>
                <td className="py-3 px-4"><StatusBadge status={item.status} /></td>
                <td className="py-3 px-4">{getActions(item)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end mt-4">
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(p - 1, 1))}
              className="w-8 h-8 flex items-center justify-center text-sm text-gray-400 border border-gray-200 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50" disabled={page === 1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 flex items-center justify-center text-sm rounded-md border transition-colors ${
                  page === p ? 'border-gray-400 bg-gray-200 text-gray-900 font-semibold' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                }`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              className="w-8 h-8 flex items-center justify-center text-sm text-gray-400 border border-gray-200 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50" disabled={page === totalPages}>›</button>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default Orders;
