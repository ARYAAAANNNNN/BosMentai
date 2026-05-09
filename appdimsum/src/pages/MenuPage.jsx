import { useState, useEffect, useCallback } from 'react';
import { useOrderContext } from '../context/OrderContext';
import { UseCart } from '../context/CartContext';
import { useParams } from 'react-router-dom';
import { paymentAPI, orderAPI, getImageUrl } from '../services/api';
import { ShoppingCart, Plus, Search, UtensilsCrossed, ArrowRight, CheckCircle, X } from 'lucide-react';

// Sub-components
import CartSheet from '../components/CartSheet';
import PaymentView from '../components/PaymentView';
import StatusView from '../components/StatusView';

// ── Toast Notification Component ─────────────────────────────────
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500 text-yellow-900',
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100]" style={{ animation: 'toastIn 0.35s ease-out' }}>
      <div className={`${colors[type] || colors.success} text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 min-w-[280px] max-w-[90vw]`}>
        {type === 'success' && <CheckCircle size={18} className="shrink-0" />}
        <span className="text-sm font-semibold flex-1">{message}</span>
        <button onClick={onClose} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity">
          <X size={14} />
        </button>
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};

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
    <div className={`w-full bg-white rounded-xl overflow-hidden shadow-sm flex flex-col border border-gray-100 transition-all ${isHabis ? 'grayscale opacity-70' : 'hover:shadow-md'}`}>
      {/* Image — square */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
        {imgSrc && !imgError ? (
          <img src={imgSrc} alt={item.name} onError={() => setImgError(true)} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${catColor} flex items-center justify-center`}>
            <UtensilsCrossed size={40} className="text-gray-300 opacity-50" />
          </div>
        )}
        {isHabis && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-xs bg-black/50 px-3 py-1 rounded-full">Stok Habis</span>
          </div>
        )}
        {isAdded && !isHabis && (
          <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {cartQty > 0 && !isHabis && !isAdded && (
          <div className="absolute top-2 right-2 bg-[#D04040] text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white">
            {cartQty}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 pt-3 pb-4 flex flex-col gap-0.5">
        <p className="text-[15px] font-bold text-gray-900 leading-tight">
          Rp {(item.harga || 0).toLocaleString('id-ID')}
        </p>
        <p className="text-[12px] font-medium text-gray-600 leading-tight line-clamp-2">
          {item.name}
        </p>
        <p className="text-[10px] text-gray-400 font-medium">
          Tersedia: {item.stok}
        </p>

        {/* Button */}
        <div className="mt-2 flex justify-center">
          <button
            onClick={() => {
              if (!isHabis) {
                onAdd(item);
                setIsAdded(true);
                setTimeout(() => setIsAdded(false), 1500);
              }
            }}
            disabled={isHabis}
            className={`w-full h-[42px] rounded-xl font-bold text-[13px] tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5 ${
              isHabis
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isAdded
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-[#D04040] text-white hover:bg-red-700 active:scale-95 shadow-sm hover:shadow-md'
            }`}
          >
            {isHabis ? 'Habis' : isAdded ? '✓ Ditambahkan' : '+ Pesan'}
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
    cart, addToCart, removeFromCart, incrementQuantity, decrementQuantity, clearCart,
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
  const [catatan, setCatatan] = useState('');

  // ── Toast State ─────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

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

  // ── Remove item from cart completely ─────────────────────────────
  const handleRemoveItem = (itemId) => {
    // Keep decrementing until item is gone, or use a direct remove
    const item = cart.find(i => i.id === itemId);
    if (item) {
      // Remove all quantity at once
      for (let i = 0; i < item.quantity; i++) {
        removeFromCart(itemId);
      }
    }
  };

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
          setCatatan('');
          showToast('Pembayaran berhasil! Pesanan sedang diproses.', 'success');
        } else if (['deny', 'cancel', 'expire'].includes(status)) {
          clearInterval(pollInterval);
          setCurrentView('failed');
          showToast('Pembayaran gagal atau expired.', 'error');
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
        catatan: catatan || '',
        items,
      });

      if (res?.success && res?.data) {
        setPaymentData(res.data);
        setCurrentView('payment');
        showToast('Pesanan dibuat! Silakan scan QR untuk bayar.', 'info');
      } else {
        showToast(res?.message || 'Gagal membuat transaksi', 'error');
      }
    } catch (err) {
      console.error('[MenuPage] Checkout error:', err);
      showToast('Gagal membuat transaksi: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [cart, noMeja, isSubmitting, catatan]);

  const handleConfirmPaid = async () => {
    if (!paymentData?.order_id) return;
    try {
      const res = await paymentAPI.getStatus(paymentData.order_id);
      const status = res?.data?.transaction_status;
      if (status === 'settlement') {
        setCurrentView('success');
        clearCart();
        setCatatan('');
        showToast('Pembayaran berhasil! Pesanan sedang diproses.', 'success');
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
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ══ TOAST ═══════════════════════════════════════════════════ */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ══ HEADER — full width red bar, content centered ══════════ */}
      <header className="bg-[#D04040] sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shrink-0 overflow-hidden">
              <img src="/images/logo-bosmentai.jpg" alt="Bos Mentai Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm tracking-tight leading-tight">QR SmartOrder</h1>
              <p className="text-white/50 text-[9px] font-medium tracking-wider">PT10 Warisan Nusantara</p>
            </div>
          </div>

          {/* Search + Table + Cart */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg h-9 flex items-center gap-2 px-3 border border-white/10 focus-within:bg-white/20 transition-all w-36 sm:w-52 lg:w-64">
              <Search size={14} className="text-white/40 shrink-0" />
              <input id="search-header" type="text" placeholder="mau makan apa..." value={search} onChange={e => setSearch(e.target.value)}
                className="bg-transparent outline-none text-xs text-white placeholder-white/40 font-medium w-full" />
            </div>

            {/* Table Badge */}
            <div className="hidden sm:flex bg-white/10 backdrop-blur-md rounded-lg h-9 px-3 items-center gap-2 border border-white/10">
              <UtensilsCrossed size={12} className="text-white/50" />
              <span className="text-white/60 text-[11px] font-bold tracking-wide">Meja {noMeja}</span>
            </div>

            {/* Cart Button */}
            <button id="btn-open-cart" onClick={handleOpenCart}
              className="bg-white/10 backdrop-blur-md rounded-lg w-9 h-9 flex items-center justify-center relative border border-white/10 active:scale-95 transition-all hover:bg-white/20">
              <ShoppingCart size={16} className="text-white/70" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FFB800] text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#D04040]" style={{ animation: 'popIn 0.3s ease-out' }}>
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ══ CATEGORIES — full width white bar, content centered ════ */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 h-12 flex items-center gap-2 overflow-x-auto scrollbar-hide no-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button key={cat} id={`cat-${cat.toLowerCase()}`} onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-5 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-[#D04040] text-white shadow-sm'
                  : 'bg-transparent text-gray-500 hover:bg-gray-100'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ══ MAIN CONTENT — centered container ═════════════════════ */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-6">

          {/* Section Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-800 text-lg">
              {activeCategory === 'Semua' ? 'Semua Menu' : activeCategory}
            </h2>
            <span className="text-xs text-gray-400 font-medium">
              › {filtered.length} menu tersedia
            </span>
          </div>

          {/* Grid / States */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-3 border-red-100 border-t-red-600 rounded-full animate-spin mb-3" />
              <p className="text-gray-400 font-medium text-sm">Memuat menu...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                <UtensilsCrossed size={40} />
              </div>
              <h3 className="font-bold text-gray-700 mb-1">Menu tidak ditemukan</h3>
              <p className="text-gray-400 text-xs">Coba ganti kategori atau kata kunci lain.</p>
              <button onClick={() => { setSearch(''); setActiveCategory('Semua'); }}
                className="mt-4 text-red-500 font-bold text-xs underline">
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-5">
              {filtered.map(item => (
                <MenuCard key={item.id} item={item} onAdd={handleAdd} cartQty={cartMap[item.id] || 0} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ══ OVERLAY MODALS ══════════════════════════════════════════ */}
      {currentView === 'cart' && (
        <CartSheet
          cart={cart}
          totalPrice={totalPrice}
          onClose={handleCloseCart}
          onIncrement={incrementQuantity}
          onDecrement={decrementQuantity}
          onRemove={handleRemoveItem}
          onClear={clearCart}
          onCheckout={handleCheckout}
          isSubmitting={isSubmitting}
          catatan={catatan}
          onCatatanChange={setCatatan}
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

      {/* ══ Global Animations ══════════════════════════════════════ */}
      <style>{`
        @keyframes popIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MenuPage;
