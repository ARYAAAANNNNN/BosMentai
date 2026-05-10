import { useState, useEffect, useCallback } from 'react';
import { useOrderContext } from '../context/OrderContext';
import { UseCart } from '../context/CartContext';
import { useParams } from 'react-router-dom';
import { paymentAPI } from '../services/api';
import { CheckCircle, X } from 'lucide-react';

import CartSheet from '../components/CartSheet';
import PaymentView from '../components/PaymentView';
import StatusView from '../components/StatusView';

/* ── Toast ─────────────────────────────────────────────── */
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = { success: '#4CAF50', error: '#f44336', info: '#2196F3', warning: '#FF9800' };

  return (
    <div style={{
      position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 100,
      animation: 'toastIn 0.35s cubic-bezier(0.175,0.885,0.32,1.275)',
    }}>
      <div style={{
        background: bg[type] || bg.success, color: '#fff', padding: '10px 18px',
        borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10,
        minWidth: 260, maxWidth: '90vw', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        fontSize: 13, fontWeight: 700,
      }}>
        {type === 'success' && <CheckCircle size={16} />}
        <span style={{ flex: 1 }}>{message}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MenuPage
   ══════════════════════════════════════════════════════════ */
const MenuPage = () => {
  const { tableId } = useParams();
  const context = useOrderContext();
  const {
    cart, addToCart, removeFromCart, incrementQuantity, decrementQuantity,
    clearCart, getTotalPrice, getTotalItems, setShowCart,
  } = UseCart();

  /* ── Fallback data jika API belum tersedia ────────── */
  const fallbackMenu = [
    { id: 1, name: 'Düşman Ayam Pedas', harga: 15000, stok: 37, id_kategori: 1 },
    { id: 2, name: 'Düşman Udang Pedas', harga: 18000, stok: 24, id_kategori: 2 },
    { id: 3, name: 'Es Krim Coklat', harga: 8000, stok: 22, id_kategori: 4 },
    { id: 4, name: 'Es Teh Manis', harga: 5000, stok: 42, id_kategori: 3 },
    { id: 5, name: 'Lumpia Ayam', harga: 12000, stok: 16, id_kategori: 1 },
  ];

  const apiItems = context?.menuItems || [];
  const menuItems = apiItems.length > 0 ? apiItems : fallbackMenu;

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('menu');
  const [paymentData, setPaymentData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [catatan, setCatatan] = useState('');
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  const noMeja = tableId || localStorage.getItem('no_meja') || '12';
  const categories = ['Semua', 'Ayam', 'Udang', 'Minuman', 'Dessert'];
  const categoryMap = { Ayam: 1, Udang: 2, Minuman: 3, Dessert: 4 };

  /* ── Font + scrollbar hide ──────────────────────────── */
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.innerHTML = `
      .hide-scroll::-webkit-scrollbar{display:none}
      .hide-scroll{-ms-overflow-style:none;scrollbar-width:none}
      @keyframes toastIn{from{opacity:0;transform:translate(-50%,-20px)}to{opacity:1;transform:translate(-50%,0)}}
    `;
    document.head.appendChild(style);

    const timer = setTimeout(() => setLoading(false), 800);
    return () => {
      clearTimeout(timer);
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);

  /* ── Normalize menu items ───────────────────────────── */
  const normalized = menuItems.map(item => ({
    ...item,
    id: item.id || item.id_menu,
    name: item.name || item.nama || item.nama_menu || '',
    harga: item.harga || 0,
    stok: item.stok ?? 99,
    id_kategori: item.id_kategori || item.kategori_id || 1,
  }));

  const filtered = normalized.filter(item => {
    const nama = (item.name || '').toLowerCase();
    const matchSearch = nama.includes(search.toLowerCase());
    if (activeCategory === 'Semua') return matchSearch;
    return matchSearch && item.id_kategori === categoryMap[activeCategory];
  });

  const cartMap = cart.reduce((a, i) => { a[i.id] = i.quantity || i.qty; return a; }, {});
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const handleAdd = (item) => addToCart({ ...item, price: item.harga });

  const handleRemoveItem = (itemId) => {
    const item = cart.find(i => i.id === itemId);
    if (item) { for (let i = 0; i < item.quantity; i++) removeFromCart(itemId); }
  };

  /* ── Payment polling ────────────────────────────────── */
  useEffect(() => {
    if (currentView !== 'payment' || !paymentData?.order_id) return;
    const poll = setInterval(async () => {
      try {
        const res = await paymentAPI.getStatus(paymentData.order_id);
        const st = res?.data?.transaction_status;
        if (st === 'settlement') { clearInterval(poll); setCurrentView('success'); clearCart(); setCatatan(''); showToast('Pembayaran berhasil!', 'success'); }
        else if (['deny','cancel','expire'].includes(st)) { clearInterval(poll); setCurrentView('failed'); showToast('Pembayaran gagal.', 'error'); }
      } catch (e) { console.error('[Poll]', e); }
    }, 3000);
    return () => clearInterval(poll);
  }, [currentView, paymentData?.order_id, clearCart]);

  const handleOpenCart = () => { setShowCart(false); setCurrentView('cart'); };
  const handleCloseCart = () => setCurrentView('menu');

  const handleCheckout = useCallback(async () => {
    if (cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const items = cart.map(i => ({ id_menu: i.id, jumlah: i.quantity }));
      const sanitizedMeja = String(noMeja).replace(/\D/g, '');
      const res = await paymentAPI.createTransaction({ no_meja: parseInt(sanitizedMeja, 10) || 1, catatan: catatan || '', items });
      if (res?.success && res?.data) { setPaymentData(res.data); setCurrentView('payment'); showToast('Pesanan dibuat! Silakan scan QR.', 'info'); }
      else showToast(res?.message || 'Gagal membuat transaksi', 'error');
    } catch (err) { showToast('Gagal: ' + err.message, 'error'); }
    finally { setIsSubmitting(false); }
  }, [cart, noMeja, isSubmitting, catatan]);

  const handleConfirmPaid = async () => {
    if (!paymentData?.order_id) return;
    try {
      const res = await paymentAPI.getStatus(paymentData.order_id);
      if (res?.data?.transaction_status === 'settlement') { setCurrentView('success'); clearCart(); setCatatan(''); showToast('Pembayaran berhasil!', 'success'); }
    } catch (e) { console.error(e); }
  };

  const handleStatusClose = () => { setCurrentView('menu'); setPaymentData(null); };

  /* ── Inline style objects ───────────────────────────── */
  const S = {
    page: { width: '100%', minHeight: '100vh', backgroundColor: '#FFFFFF', fontFamily: "'Poppins', sans-serif", display: 'flex', flexDirection: 'column' },
    header: { padding: '20px 16px 12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    brandSub: { fontSize: 12, color: '#999999', fontWeight: 400, margin: 0, lineHeight: '1.4' },
    brandMain: { fontSize: 20, color: '#000000', fontWeight: 700, margin: 0, lineHeight: '1.3' },
    cartBtn: { background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 4, marginTop: 2 },
    separator: { height: 1, backgroundColor: '#EEEEEE' },
    tabRow: { display: 'flex', gap: 20, padding: '12px 16px 0 16px', overflowX: 'auto' },
    subheader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 0 16px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 12, rowGap: 16, padding: 16 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 12, boxShadow: '0px 2px 8px rgba(0,0,0,0.08)', padding: 12, display: 'flex', flexDirection: 'column' },
    cardName: { fontSize: 16, fontWeight: 700, color: '#000000', margin: 0, lineHeight: '1.3' },
    cardPrice: { fontSize: 16, fontWeight: 400, color: '#000000', margin: '4px 0 0 0' },
    cardStock: { fontSize: 12, fontWeight: 400, color: '#888888', margin: '4px 0 0 0' },
    orderBtn: { width: '100%', height: 36, borderRadius: 8, backgroundColor: '#FF6B35', color: '#FFFFFF', fontWeight: 700, fontSize: 14, border: 'none', marginTop: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Poppins', sans-serif" },
    orderBtnDisabled: { width: '100%', height: 36, borderRadius: 8, backgroundColor: '#E0E0E0', color: '#999', fontWeight: 700, fontSize: 14, border: 'none', marginTop: 10, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Poppins', sans-serif" },
  };

  /* ── Cart icon SVG (black outline) ──────────────────── */
  const CartIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );

  /* ══ RENDER ══════════════════════════════════════════════ */
  return (
    <div style={S.page}>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── HEADER ──────────────────────────────────────── */}
      <header style={S.header}>
        <div>
          <p style={S.brandSub}>QR SmartOrder</p>
          <h1 style={S.brandMain}>AYCE Düşman Restaurant</h1>
        </div>
        <button style={S.cartBtn} onClick={handleOpenCart} aria-label="Keranjang">
          <CartIcon />
          {totalItems > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              backgroundColor: '#FF6B35', color: '#fff', fontSize: 10, fontWeight: 800,
              width: 18, height: 18, borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', border: '2px solid #fff',
            }}>{totalItems}</span>
          )}
        </button>
      </header>

      {/* ── SEPARATOR ───────────────────────────────────── */}
      <div style={S.separator} />

      {/* ── CATEGORY TABS ───────────────────────────────── */}
      <div className="hide-scroll" style={S.tabRow}>
        {categories.map(cat => {
          const isActive = activeCategory === cat;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              background: 'none', border: 'none', padding: '8px 0 10px 0', cursor: 'pointer',
              fontSize: 14, fontWeight: isActive ? 700 : 400, color: '#000000',
              borderBottom: isActive ? '3px solid #FF6B35' : '3px solid transparent',
              whiteSpace: 'nowrap', fontFamily: "'Poppins', sans-serif",
              transition: 'border-color 0.2s',
            }}>
              {cat}
            </button>
          );
        })}
      </div>

      {/* ── SUBHEADER ───────────────────────────────────── */}
      <div style={S.subheader}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#000000', margin: 0 }}>
          {activeCategory === 'Semua' ? 'Semua Menu' : activeCategory}
        </h2>
        <span style={{ fontSize: 14, color: '#888888', fontWeight: 400 }}>
          {filtered.length} menu tersedia
        </span>
      </div>

      {/* ── GRID MENU ───────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 30, height: 30, border: '4px solid #eee', borderTop: '4px solid #FF6B35', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#999', fontSize: 13, marginTop: 14 }}>Memuat menu...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 16px', color: '#999' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#333', marginBottom: 4 }}>Menu tidak ditemukan</p>
            <p style={{ fontSize: 13 }}>Coba ganti kategori atau kata kunci lain.</p>
          </div>
        ) : (
          <div style={S.grid}>
            {filtered.map(item => {
              const isHabis = item.stok === 0;
              const qty = cartMap[item.id] || 0;
              return (
                <div key={item.id} style={{ ...S.card, position: 'relative' }}>
                  {/* Badge qty in cart */}
                  {qty > 0 && !isHabis && (
                    <span style={{
                      position: 'absolute', top: -6, right: -6,
                      backgroundColor: '#FF6B35', color: '#fff', fontSize: 10, fontWeight: 800,
                      width: 20, height: 20, borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', border: '2px solid #fff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                    }}>{qty}</span>
                  )}

                  <h3 style={S.cardName}>{item.name}</h3>
                  <p style={S.cardPrice}>Rp {(item.harga || 0).toLocaleString('id-ID')}</p>
                  <p style={S.cardStock}>Tersedia : {item.stok}</p>
                  <button
                    onClick={() => { if (!isHabis) handleAdd(item); }}
                    disabled={isHabis}
                    style={isHabis ? S.orderBtnDisabled : S.orderBtn}
                  >
                    {isHabis ? 'Habis' : '+ Pesan'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ OVERLAY MODALS ════════════════════════════════ */}
      {currentView === 'cart' && (
        <CartSheet cart={cart} totalPrice={totalPrice} onClose={handleCloseCart}
          onIncrement={incrementQuantity} onDecrement={decrementQuantity}
          onRemove={handleRemoveItem} onClear={clearCart} onCheckout={handleCheckout}
          isSubmitting={isSubmitting} catatan={catatan} onCatatanChange={setCatatan} />
      )}
      {currentView === 'payment' && paymentData && (
        <PaymentView paymentData={paymentData} onPaid={handleConfirmPaid}
          onClose={() => { setCurrentView('menu'); setPaymentData(null); }} />
      )}
      {(currentView === 'success' || currentView === 'failed') && (
        <StatusView status={currentView} orderId={paymentData?.order_id} onClose={handleStatusClose} />
      )}
    </div>
  );
};

export default MenuPage;
