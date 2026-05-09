import { useState, useEffect, useCallback } from 'react';
import { useOrderContext } from '../context/OrderContext';
import { UseCart } from '../context/CartContext';
import { useParams } from 'react-router-dom';
import { paymentAPI, getImageUrl } from '../services/api';
import { ShoppingCart, Plus, Search, UtensilsCrossed, ArrowRight } from 'lucide-react';

// Sub-components
import CartSheet from '../components/CartSheet';
import PaymentView from '../components/PaymentView';
import StatusView from '../components/StatusView';

// ── Warna placeholder per kategori ────────────────────────────────
const PLACEHOLDER_COLORS = {
  1: 'from-red-50 to-orange-100',
  2: 'from-orange-50 to-amber-100',
  3: 'from-blue-50 to-cyan-100',
  4: 'from-pink-50 to-purple-100',
};

// ── MenuCard Sub-Component ────────────────────────────────────────
const MenuCard = ({ item, onAdd, cartQty }) => {
  const [imgError, setImgError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const isHabis = item.stok === 0;
  const imgSrc = item.image ? getImageUrl(item.image) : null;
  const catColor = PLACEHOLDER_COLORS[item.id_kategori] || 'from-gray-50 to-slate-100';

  return (
    <div className={`w-full max-w-[210px] h-full sm:h-[340px] mx-auto bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col border border-gray-100 transition-all active:scale-[0.98] ${isHabis ? 'grayscale' : 'hover:shadow-md'}`}>
      {/* Image */}
      <div className="relative aspect-square sm:aspect-auto sm:h-[150px] w-full shrink-0 overflow-hidden bg-gray-50">
        {imgSrc && !imgError ? (
          <img src={imgSrc} alt={item.name} onError={() => setImgError(true)} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${catColor} flex items-center justify-center`}>
            <UtensilsCrossed size={48} className="text-gray-300 opacity-50" />
          </div>
        )}
        {isHabis && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-white/90 text-[#D04040] font-black text-[10px] px-3 py-1 rounded-full shadow-lg border border-red-100">STOK HABIS</span>
          </div>
        )}
        {isAdded && !isHabis && (
          <div className="absolute inset-0 bg-green-500/60 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
            <div className="bg-white/90 p-2 rounded-full shadow-xl">
              <Plus size={24} className="text-green-600 animate-bounce" strokeWidth={4} />
            </div>
          </div>
        )}
        {cartQty > 0 && !isHabis && !isAdded && (
          <div className="absolute top-2 right-2 bg-[#D04040] text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg border-2 border-white animate-in zoom-in duration-300">
            {cartQty}
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <div className="mb-0.5">
          <span className="font-black text-gray-900 text-[16px] sm:text-[18px]">
            Rp {(item.harga || 0).toLocaleString('id-ID')}
          </span>
        </div>
        <h3 className="font-extrabold text-gray-900 text-[11px] sm:text-[13px] leading-tight line-clamp-2 mb-2">{item.name}</h3>
        <div className="mt-auto">
          <p className="text-[10px] sm:text-[11px] text-gray-400 font-bold mb-3">Tersedia : {item.stok}</p>
          <button
            onClick={() => {
              if (!isHabis) {
                onAdd(item);
                setIsAdded(true);
                setTimeout(() => setIsAdded(false), 1500);
              }
            }}
            disabled={isHabis}
            className={`w-full h-[38px] sm:h-[42px] rounded-xl font-bold text-[11px] sm:text-[13px] transition-all flex items-center justify-center gap-2 ${
              isHabis 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : isAdded 
                  ? 'bg-green-500 text-white shadow-lg shadow-green-200' 
                  : 'bg-[#D04040] text-white hover:bg-[#B03030] active:bg-[#902020] shadow-sm'
            }`}
          >
            {isHabis ? null : isAdded ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-in zoom-in" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <Plus size={14} strokeWidth={3} />
            )}
            {isHabis ? 'Habis' : isAdded ? 'Ditambahkan' : 'Pesan'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// MenuPage — Main Component
// ══════════════════════════════════════════════════════════════════
const MenuPage = () => {
  const { tableId } = useParams();
  const context = useOrderContext();
  const {
    cart, addToCart, incrementQuantity, decrementQuantity, clearCart,
    getTotalPrice, getTotalItems, showCart, setShowCart
  } = UseCart();

  const menuItems = context?.menuItems || [];

  // ── UI State ────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [loading, setLoading] = useState(true);

  // ── Payment Flow State ──────────────────────────────────────────
  // currentView: 'menu' | 'cart' | 'payment' | 'success' | 'failed'
  const [currentView, setCurrentView] = useState('menu');
  const [paymentData, setPaymentData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const noMeja = tableId || localStorage.getItem('no_meja') || '12';
  const categories = ["Semua", "Dimsum", "Goreng", "Minuman", "Dessert"];
  const categoryMap = { "Dimsum": 1, "Goreng": 2, "Minuman": 3, "Dessert": 4 };

  // ── Loading Timer ───────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // ── Normalize & Filter Menu Items ───────────────────────────────
  const normalized = menuItems.map(item => ({
    ...item,
    id: item.id || item.id_menu,
    name: item.name || item.nama || item.nama_menu || '',
    image: item.image || item.gambar || null,
    harga: item.harga || 0,
    stok: item.stok ?? 99,
    id_kategori: item.id_kategori || item.kategori_id || 1
  }));

  const filtered = normalized.filter(item => {
    const nama = (item.name || '').toLowerCase();
    const matchSearch = nama.includes(search.toLowerCase());
    if (activeCategory === 'Semua') return matchSearch;
    return matchSearch && (item.id_kategori || item.kategori_id) === categoryMap[activeCategory];
  });

  const cartMap = cart.reduce((acc, i) => { acc[i.id] = i.quantity || i.qty; return acc; }, {});
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handleAdd = (item) => addToCart({ ...item, price: item.harga });

  // ── Payment Polling ─────────────────────────────────────────────
  useEffect(() => {
    if (currentView !== 'payment' || !paymentData?.order_id) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await paymentAPI.getStatus(paymentData.order_id);
        const status = res?.data?.transaction_status;
        console.log('[MenuPage] Poll status:', status);

        if (status === 'settlement') {
          clearInterval(pollInterval);
          setCurrentView('success');
          clearCart();
        } else if (['deny', 'cancel', 'expire'].includes(status)) {
          clearInterval(pollInterval);
          setCurrentView('failed');
        }
      } catch (err) {
        console.error('[MenuPage] Poll error:', err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [currentView, paymentData?.order_id, clearCart]);

  // ── Handlers ────────────────────────────────────────────────────
  const handleOpenCart = () => {
    setShowCart(false);
    setCurrentView('cart');
  };

  const handleCloseCart = () => setCurrentView('menu');

  const handleCheckout = useCallback(async () => {
    if (cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const items = cart.map(item => ({
        id_menu: item.id,
        jumlah: item.quantity,
      }));

      const res = await paymentAPI.createTransaction({
        no_meja: parseInt(noMeja, 10),
        catatan: '',
        items,
      });

      if (res?.success && res?.data) {
        setPaymentData(res.data);
        setCurrentView('payment');
      } else {
        alert(res?.message || 'Gagal membuat transaksi');
      }
    } catch (err) {
      console.error('[MenuPage] Checkout error:', err);
      alert('Gagal membuat transaksi: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [cart, noMeja, isSubmitting]);

  const handleConfirmPaid = async () => {
    if (!paymentData?.order_id) return;
    try {
      const res = await paymentAPI.getStatus(paymentData.order_id);
      const status = res?.data?.transaction_status;
      if (status === 'settlement') {
        setCurrentView('success');
        clearCart();
      }
      // If still pending, the polling will handle it
    } catch (err) {
      console.error('[MenuPage] Check paid error:', err);
    }
  };

  const handleStatusClose = () => {
    setCurrentView('menu');
    setPaymentData(null);
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="w-full relative flex flex-col min-h-screen">

        {/* ══ HEADER ═══════════════════════════════════════════════ */}
        <header className="bg-[#D04040] sticky top-0 z-40 h-[65px] flex items-center shadow-md">
          <div className="w-full px-8 md:px-12 lg:px-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 overflow-hidden border-2 border-white/20">
                <img src="/images/logo-bosmentai.jpg" alt="Bos Mentai Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-white font-black text-lg tracking-tight leading-tight">BOS MENTAI</h1>
                <p className="text-white/40 text-[9px] font-bold tracking-widest -mt-0.5">SMART ORDER</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-xl h-10 flex items-center gap-2 px-4 border border-white/10 focus-within:bg-white/20 transition-all w-32 sm:w-56">
                <Search size={16} className="text-white/40 shrink-0" />
                <input id="search-header" type="text" placeholder="Cari makanan..." value={search} onChange={e => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-sm text-white placeholder-white/30 font-medium w-full" />
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl h-10 px-4 flex items-center gap-2 border border-white/10">
                <UtensilsCrossed size={14} className="text-white/60" />
                <span className="text-white/60 text-[12px] font-bold tracking-wide">MEJA {noMeja}</span>
              </div>
              <button id="btn-open-cart" onClick={handleOpenCart}
                className="bg-white/10 backdrop-blur-md rounded-xl w-10 h-10 flex items-center justify-center relative border border-white/10 shadow-lg active:scale-95 transition-all hover:bg-white/15">
                <ShoppingCart size={18} className="text-white/60" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#FFB800] text-white text-[9px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border-2 border-[#D04040] shadow-sm animate-in zoom-in duration-300">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* ══ CATEGORIES ═══════════════════════════════════════════ */}
        <div className="bg-white border-b border-gray-100 shadow-sm sticky top-[65px] z-30 h-[55px] flex items-center">
          <div className="px-8 md:px-12 lg:px-20 flex gap-3 overflow-x-auto scrollbar-hide no-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {categories.map(cat => (
              <button key={cat} id={`cat-${cat.toLowerCase()}`} onClick={() => setActiveCategory(cat)}
                className={`shrink-0 w-[110px] h-[36px] flex items-center justify-center rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                  activeCategory === cat ? 'bg-[#D04040] text-white shadow-md shadow-red-900/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ══ MENU GRID ════════════════════════════════════════════ */}
        <main className="flex-1 px-4 md:px-10 lg:px-16 py-5 bg-gray-50/50 pb-28">
          <div className="flex items-center justify-between h-[40px] mb-4">
            <h2 className="font-black text-gray-800 text-lg tracking-tight">
              {activeCategory === 'Semua' ? 'Pilihan Menu' : activeCategory}
            </h2>
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-gray-500 font-bold">{filtered.length} Tersedia</span>
            </div>
          </div>

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
              <button onClick={() => { setSearch(''); setActiveCategory('Semua'); }}
                className="mt-6 text-red-600 font-black text-xs uppercase tracking-widest border-b-2 border-red-600">
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4 sm:gap-6 justify-items-center">
              {filtered.map(item => (
                <MenuCard key={item.id} item={item} onAdd={handleAdd} cartQty={cartMap[item.id] || 0} />
              ))}
            </div>
          )}
        </main>


        {/* ══ OVERLAY MODALS ══════════════════════════════════════= */}
        {currentView === 'cart' && (
          <CartSheet
            cart={cart}
            totalPrice={totalPrice}
            onClose={handleCloseCart}
            onIncrement={incrementQuantity}
            onDecrement={decrementQuantity}
            onClear={clearCart}
            onCheckout={handleCheckout}
            isSubmitting={isSubmitting}
          />
        )}

        {currentView === 'payment' && paymentData && (
          <PaymentView
            paymentData={paymentData}
            onPaid={handleConfirmPaid}
            onClose={() => { setCurrentView('menu'); setPaymentData(null); }}
          />
        )}

        {(currentView === 'success' || currentView === 'failed') && (
          <StatusView
            status={currentView}
            orderId={paymentData?.order_id}
            onClose={handleStatusClose}
          />
        )}
      </div>
    </div>
  );
};

export default MenuPage;
