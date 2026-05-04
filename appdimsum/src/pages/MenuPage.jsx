import { useState, useEffect } from 'react';
import { useOrderContext } from '../context/OrderContext';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI, STORAGE_URL } from '../services/api';
import { Search, ShoppingCart, ChevronRight, X, Minus, Plus } from 'lucide-react';

const BACKEND_URL = STORAGE_URL;

// ─── MenuCard ────────────────────────────────────
const MenuCard = ({ item, onAdd, isAdded }) => {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered]   = useState(false);
  const isHabis = item.stok === 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white rounded-3xl border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 relative"
      style={{
        boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.08)' : '0 4px 12px rgba(0,0,0,0.03)',
        transform: hovered ? 'translateY(-5px)' : 'none',
        opacity: isHabis ? 0.7 : 1,
      }}
    >
      <div className="relative h-44 overflow-hidden bg-gray-50">
        {item.image && !imgError ? (
          <img
            src={item.image}
            alt={item.name}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? 'scale-110' : 'scale-100'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-200">
            <ShoppingCart size={48} />
          </div>
        )}

        {isHabis && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-white text-red-600 font-bold text-xs px-4 py-2 rounded-full shadow-lg">
              HABIS
            </span>
          </div>
        )}

        {isAdded && !isHabis && (
          <div className="absolute inset-0 bg-green-500/80 flex flex-col items-center justify-center text-white backdrop-blur-[2px] animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center mb-1">
                <Plus size={20} />
            </div>
            <span className="font-bold text-xs">DITAMBAHKAN</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2 min-h-[40px]">
          {item.name}
        </h3>
        
        <div className="mt-auto pt-2 flex items-center justify-between">
          <p className="text-[#C0392B] font-extrabold text-sm">
            Rp {(item.harga || 0).toLocaleString('id-ID')}
          </p>
          <button
            onClick={() => !isHabis && onAdd(item)}
            disabled={isHabis}
            className={`p-2 rounded-xl transition-all active:scale-90 ${
              isHabis 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-red-50 text-[#C0392B] hover:bg-[#C0392B] hover:text-white'
            }`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Halaman Utama ────────────────────────────────────────────────────────────
const MenuPage = () => {
  const navigate = useNavigate();
  const { menuItems } = useOrderContext();
  const [cart, setCart] = useState([]);
  const [addedItems, setAddedItems] = useState({});
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [showCart, setShowCart] = useState(false);

  const categories = ['Semua', 'Makanan', 'Minuman', 'Snack', 'Penutup'];
  const noMeja = localStorage.getItem('no_meja') || '12';

  const categoryMap = {
    'Makanan': 1,
    'Minuman': 2,
    'Snack': 3,
    'Penutup': 4
  };

  const filteredMenu = menuItems
    .filter(item => {
      const nama = (item.nama || item.nama_menu || '').toLowerCase();
      const matchSearch = nama.includes(search.toLowerCase());
      if (activeCategory === 'Semua') return matchSearch;
      return matchSearch && (item.id_kategori || item.kategori_id) === categoryMap[activeCategory];
    })
    .map(item => ({
      ...item,
      id: item.id,
      name: item.nama || item.nama_menu,
      image: item.image ? `${BACKEND_URL}${item.image}` : null,
      harga: item.harga || 0,
    }));

  const handleAdd = (item) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id);
      return ex
        ? prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...item, qty: 1 }];
    });
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => setAddedItems(prev => ({ ...prev, [item.id]: false })), 1000);
  };

  const handleQty = (id, delta) => {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
          .filter(i => i.qty > 0)
    );
  };

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + (i.harga * i.qty), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    // Store cart to local storage for Review Page
    localStorage.setItem('pending_cart', JSON.stringify(cart));
    navigate('/review');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {/* Red Wave Header */}
      <div className="bg-[#C0392B] pt-8 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="max-w-2xl mx-auto flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-white text-2xl font-black italic tracking-tight">Bos Mentai</h1>
            <p className="text-white/70 text-xs font-medium">Restoran Ala Carte Modern</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-2xl flex items-center gap-2">
            <span className="text-white font-bold text-sm">Meja {noMeja}</span>
          </div>
        </div>
        
        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 w-full leading-none">
          <svg viewBox="0 0 500 80" preserveAspectRatio="none" className="h-10 w-full fill-gray-50">
            <path d="M0,0 C150,80 350,0 500,80 L500,80 L0,80 Z"></path>
          </svg>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-8 relative z-20">
        {/* Search Bar */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-2 flex items-center mb-6 border border-gray-100">
          <div className="p-3 text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Cari menu favoritmu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-700 placeholder-gray-300 pr-4"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat 
                  ? 'bg-[#C0392B] text-white shadow-lg shadow-red-200 scale-105' 
                  : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-extrabold text-gray-900">{activeCategory}</h2>
            <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-1 rounded-full font-bold">
              {filteredMenu.length} MENU
            </span>
          </div>

          {filteredMenu.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-[40px] border border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-400 font-bold text-sm">Menu tidak ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredMenu.map(item => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onAdd={handleAdd}
                  isAdded={!!addedItems[item.id]}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-6 z-50 animate-in slide-in-from-bottom duration-500">
          <button
            onClick={handleCheckout}
            className="max-w-2xl mx-auto w-full bg-[#C0392B] text-white p-5 rounded-[28px] shadow-2xl shadow-red-300 flex items-center justify-between group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-xl relative">
                <ShoppingCart size={20} />
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-800 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#C0392B]">
                  {totalItems}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Keranjang</p>
                <p className="font-bold text-sm">Rp {totalPrice.toLocaleString('id-ID')}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 font-bold text-sm">
              Bayar Sekarang
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
