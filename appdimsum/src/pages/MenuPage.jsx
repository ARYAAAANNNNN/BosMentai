import { useState, useEffect } from 'react';
import { useOrderContext } from '../context/OrderContext';
import { UseCart } from '../context/CartContext';
import { useNavigate, useParams } from 'react-router-dom';
import { orderAPI, getImageUrl } from '../services/api';
import { ShoppingCart, X, Minus, Plus, CheckCircle2, Search, UtensilsCrossed, ArrowRight } from 'lucide-react';

// Data demo dihapus agar hanya menggunakan data asli dari database.

// ── Warna placeholder per kategori ────────────────────────────────
const PLACEHOLDER_COLORS = {
  1: 'from-red-50 to-orange-100',
  2: 'from-orange-50 to-amber-100',
  3: 'from-blue-50 to-cyan-100',
  4: 'from-pink-50 to-purple-100',
};

const PLACEHOLDER_ICONS = {
  1: '🥟',
  2: '🍤',
  3: '🥤',
  4: '🍮',
};

// ── Kartu Menu ────────────────────────────────────────────────────
const MenuCard = ({ item, onAdd, cartQty }) => {
  const [imgError, setImgError] = useState(false);
  const isHabis = item.stok === 0;
  const imgSrc = item.image ? getImageUrl(item.image) : null;
  const catColor = PLACEHOLDER_COLORS[item.id_kategori] || 'from-gray-50 to-slate-100';

  return (
    <div className={`w-full max-w-[210px] h-full sm:h-[340px] mx-auto bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col border border-gray-100 transition-all active:scale-[0.98] ${isHabis ? 'grayscale' : 'hover:shadow-md'}`}>
      {/* Container Gambar */}
      <div className="relative aspect-square sm:aspect-auto sm:h-[150px] w-full shrink-0 overflow-hidden bg-gray-50">
        {imgSrc && !imgError ? (
          <img
            src={imgSrc}
            alt={item.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${catColor} flex items-center justify-center`}>
            <UtensilsCrossed size={48} className="text-gray-300 opacity-50" />
          </div>
        )}

        {/* Badge HABIS */}
        {isHabis && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-white/90 text-red-600 font-black text-[10px] px-3 py-1 rounded-full shadow-lg border border-red-100">
              STOK HABIS
            </span>
          </div>
        )}

        {/* Badge Qty Keranjang */}
        {cartQty > 0 && !isHabis && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg border-2 border-white animate-in zoom-in duration-300">
            {cartQty}
          </div>
        )}
      </div>

      {/* Konten Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {/* Harga Terintegrasi (Di atas Nama Menu) */}
        <div className="mb-0.5">
          <span className="font-black text-gray-900 text-[16px] sm:text-[18px]">
            Rp {(item.harga || 0).toLocaleString('id-ID')}
          </span>
        </div>

        <h3 className="font-extrabold text-gray-900 text-[11px] sm:text-[13px] leading-tight line-clamp-2 mb-2">
          {item.name}
        </h3>

        <div className="mt-auto">
          <p className="text-[10px] sm:text-[11px] text-gray-400 font-bold mb-3">
            Tersedia : {item.stok}
          </p>

          <button
            onClick={() => !isHabis && onAdd(item)}
            disabled={isHabis}
            className={`w-full h-[38px] sm:h-[42px] rounded-xl font-bold text-[11px] sm:text-[13px] transition-all flex items-center justify-center gap-2 ${
              isHabis
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#7A1B1B] text-white hover:bg-[#912424] active:bg-[#631414] shadow-sm'
            }`}
          >
            {!isHabis && <Plus size={14} strokeWidth={3} />}
            {isHabis ? 'Habis' : 'Pesan'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Halaman Utama ─────────────────────────────────────────────────
const MenuPage = () => {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const context = useOrderContext();
  const { 
    cart, 
    addToCart, 
    decrementQuantity, 
    getTotalPrice, 
    getTotalItems, 
    setShowCart, 
    showCart 
  } = UseCart();

  const menuItems = context?.menuItems || [];

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(true);

  const noMeja = tableId || localStorage.getItem('no_meja') || '12';

  // Category Configuration
  const categories = ["Semua", "Dimsum", "Goreng", "Minuman", "Dessert"];
  const categoryMap = { "Dimsum": 1, "Goreng": 2, "Minuman": 3, "Dessert": 4 };

  // Sync Loading state
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Normalize API items
  const normalized = (menuItems.length > 0 ? menuItems : []).map(item => ({
    ...item,
    id:    item.id || item.id_menu,
    name:  item.name || item.nama || item.nama_menu || '',
    image: item.image || item.gambar || null,
    harga: item.harga || 0,
    stok:  item.stok ?? 99,
    id_kategori: item.id_kategori || item.kategori_id || 1
  }));

  const filtered = normalized.filter(item => {
    const nama = (item.name || '').toLowerCase();
    const matchSearch = nama.includes(search.toLowerCase());
    if (activeCategory === 'Semua') return matchSearch;
    const catId = item.id_kategori || item.kategori_id;
    return matchSearch && catId === categoryMap[activeCategory];
  });

  const cartMap = cart.reduce((acc, i) => { acc[i.id] = i.quantity || i.qty; return acc; }, {});
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handleAdd = (item) => {
    addToCart({
      ...item,
      price: item.harga
    });
  };

  const handleQty = (id, delta) => {
    if (delta > 0) {
      const item = normalized.find(i => i.id === id);
      if (item) handleAdd(item);
    } else {
      decrementQuantity(id);
    }
  };

  const handleGoToCheckout = () => {
    setShowCart(false);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="w-full relative flex flex-col min-h-screen">
        
        {/* ══ HEADER ══════════════════════════════════════════════ */}
        <header className="bg-[#7A1B1B] sticky top-0 z-40 h-[60px] flex items-center">
          <div className="w-full px-5 md:px-10 lg:px-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Circle Logo Placeholder */}
              <div className="w-8 h-8 bg-gray-400/50 rounded-full flex items-center justify-center shrink-0">
                <div className="w-[26px] h-[26px] bg-gray-300 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-white font-bold text-base tracking-tight leading-tight">QR SmartOrder</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Small Search Bar in Header */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg h-8 flex items-center gap-2 px-3 border border-white/5 focus-within:bg-white/20 transition-all w-28 sm:w-40">
                <Search size={14} className="text-white/40 shrink-0" />
                <input
                  id="search-header"
                  type="text"
                  placeholder="Cari..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-xs text-white placeholder-white/30 font-medium w-full"
                />
              </div>

              {/* Table Info / Special Action Button */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg h-8 px-3 flex items-center gap-1.5 border border-white/5 cursor-pointer hover:bg-white/15 transition-all">
                <UtensilsCrossed size={13} className="text-white/60" />
                <span className="text-white/40 text-[11px] font-medium tracking-wide">MEJA {noMeja}</span>
              </div>
              
              <button
                id="btn-open-cart"
                onClick={() => setShowCart(true)}
                className="bg-white/10 backdrop-blur-md rounded-lg w-8 h-8 flex items-center justify-center relative border border-white/5 shadow-lg active:scale-95 transition-all hover:bg-white/15"
              >
                <ShoppingCart size={15} className="text-white/60" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#7A1B1B]">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

        </header>

        {/* Sticky Container for Categories */}
        <div className="bg-white border-b border-gray-100 shadow-sm sticky top-[60px] z-30 h-[50px] flex items-center">
          {/* Category Tabs */}
          <div className="px-4 md:px-10 lg:px-16 flex gap-2 overflow-x-auto scrollbar-hide no-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {categories.map(cat => (
              <button
                key={cat}
                id={`cat-${cat.toLowerCase()}`}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 w-[100px] h-[30px] flex items-center justify-center rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#7A1B1B] text-white shadow-md shadow-red-900/20'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ══ BODY ════════════════════════════════════════════════ */}
        <main className="flex-1 px-4 md:px-10 lg:px-16 py-5 bg-gray-50/50 pb-28">
          
          <div className="flex items-center justify-between h-[40px] mb-4">
            <h2 className="font-black text-gray-800 text-lg tracking-tight">
              {activeCategory === 'Semua' ? 'Pilihan Menu' : activeCategory}
            </h2>
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-gray-500 font-bold">{filtered.length} Tersedia</span>
            </div>
          </div>

          {/* Grid Layout */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
              <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-400 font-bold text-sm">Memuat menu...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                <UtensilsCrossed size={48} />
              </div>
              <h3 className="font-black text-gray-800 mb-1">Menu tidak ditemukan</h3>
              <p className="text-gray-400 text-xs px-10">Coba ganti kategori atau cari dengan kata kunci lain.</p>
              <button 
                onClick={() => {setSearch(''); setActiveCategory('Semua');}}
                className="mt-6 text-red-600 font-black text-xs uppercase tracking-widest border-b-2 border-red-600"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4 sm:gap-6 justify-items-center">
              {filtered.map(item => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onAdd={handleAdd}
                  cartQty={cartMap[item.id] || 0}
                />
              ))}
            </div>
          )}
        </main>

        {/* ══ CART BOTTOM BAR ══════════════════════════════════════ */}
        {totalItems > 0 && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 pb-6 z-40 pointer-events-none">
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-[#7A1B1B] h-14 rounded-2xl shadow-2xl shadow-red-900/30 pointer-events-auto flex items-center justify-between px-5 transition-transform active:scale-95 group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center text-white relative">
                  <ShoppingCart size={18} />
                  <span className="absolute -top-1.5 -right-1.5 bg-white text-red-600 text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                    {totalItems}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-red-100 font-bold uppercase leading-none opacity-80">Total Pesanan</p>
                  <p className="text-white font-black text-sm">Rp {totalPrice.toLocaleString('id-ID')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-white font-black text-xs uppercase tracking-widest">
                Konfirmasi Pesanan
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        )}

        {/* ══ OVERLAY DIM ═════════════════════════════════════════ */}
        {showSuccess && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 animate-in fade-in duration-300"
          />
        )}

        {/* ══ SUCCESS POP-UP ══════════════════════════════════════ */}
        {showSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in zoom-in duration-300">
            <div className="bg-white rounded-[40px] p-10 max-w-[320px] w-full text-center shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)]">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20" />
                <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center border-8 border-green-50 shadow-lg">
                  <CheckCircle2 size={48} className="text-white" />
                </div>
              </div>
              <h3 className="font-black text-gray-900 text-2xl mb-2 tracking-tight">Diterima!</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed px-2">
                Pesanan Anda sedang kami teruskan ke bagian dapur. Mohon ditunggu ya! 🥟
              </p>
              <div className="mt-8 flex justify-center">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
