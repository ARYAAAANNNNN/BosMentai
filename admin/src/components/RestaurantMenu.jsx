import React, { useState } from 'react';
import { useOrderContext } from '../context/OrderContext';
import { STORAGE_URL } from '../services/api';

const getStatus = (stok) => {
  const n = parseInt(stok) || 0;
  if (n === 0)  return 'Habis';
  if (n <= 5)   return 'Hampir Habis';
  if (n <= 20)  return 'Menipis';
  return 'Tersedia';
};

// ─── Ambil jumlah pesanan dari berbagai kemungkinan field nama ──────
const getPesanan = (item) => {
  return (
    item.pesanan        ??
    item.total_pesanan  ??
    item.jumlah_pesanan ??
    item.order_count    ??
    item.terjual        ??
    item.sold           ??
    0
  );
};

const STATUS_TABS = ['Semua', 'Tersedia', 'Menipis', 'Hampir Habis', 'Habis'];

const statusStyle = {
  Tersedia:       { text: 'text-green-500',  label: 'Tersedia'     },
  Menipis:        { text: 'text-yellow-500', label: 'Menipis'      },
  'Hampir Habis': { text: 'text-orange-500', label: 'Hampir Habis' },
  Habis:          { text: 'text-red-500',    label: 'Habis'        },
};

const RestaurantMenu = ({ searchTerm = '' }) => {
  const { menuItems } = useOrderContext();
  const [activeTab, setActiveTab] = useState('Semua');

  const filteredItems = menuItems.filter(item => {
    const name     = item.nama || item.nama_menu || item.name || '';
    const category = item.kategori || item.category || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filtered = filteredItems.filter(item => {
    const status = getStatus(item.stok);
    if (activeTab === 'Semua') return true;
    return status === activeTab;
  });

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Menu Restoran</h2>

      {/* ── Tab ── */}
      <div className="flex gap-3 border-b border-gray-200 mb-4 overflow-x-auto pb-1">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-2 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === tab
                ? 'text-[#C0392B] border-[#C0392B]'
                : 'text-gray-400 border-transparent hover:text-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto max-h-[185px] space-y-3">
        {filtered.length === 0 ? (
          <p className="flex items-center justify-center h-full text-gray-400 text-sm">
            Tidak ada menu
          </p>
        ) : (
          filtered.map(item => {
            const status  = getStatus(item.stok);
            const style   = statusStyle[status];
            const pesanan = getPesanan(item); // ← pakai helper, bukan hardcode ?? 0

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {/* Gambar */}
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  {item.image ? (
                    <img
                      src={`${STORAGE_URL}${item.image}`}
                      alt={item.nama}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-2xl" />
                  )}
                </div>

                {/* Nama & Kategori */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {item.nama || item.nama_menu || item.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.kategori || item.category}
                  </p>
                </div>

                {/* Jumlah Pesanan — hanya tampil jika > 0 */}
                <p className="text-sm text-gray-500 shrink-0 w-24 text-center font-medium">
                  {pesanan > 0 && (
                    <span className="text-gray-700 font-semibold">{pesanan} Pesanan</span>
                  )}
                </p>

                {/* Status Stok */}
                <p className={`text-sm font-bold shrink-0 w-28 text-right ${style.text}`}>
                  {style.label}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RestaurantMenu;
