import { useState, useEffect } from 'react';
import { useOrderContext } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';
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
    <div className={`w-full max-w-[180px] h-full sm:h-[320px] mx-auto bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col border border-gray-100 transition-all active:scale-[0.98] ${isHabis ? 'grayscale' : 'hover:shadow-md'}`}>
      {/* Container Gambar */}
      <div className="relative aspect-square sm:aspect-auto sm:h-[130px] w-full shrink-0 overflow-hidden bg-gray-50">
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
            <UtensilsCrossed size={40} className="text-gray-300 opacity-50" />
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

        {/* Harga Badge Overlay */}
        <div className="absolute bottom-2 left-2 bg-white px-2 py-0.5 rounded-full shadow-sm">
          <span className="font-extrabold text-red-600 text-[9px] sm:text-[10px]">
            Rp {(item.harga || 0).toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Konten Info */}
      <div className="p-2 sm:p-3 flex flex-col flex-1">
        <h3 className="font-extrabold text-gray-900 text-[12px] sm:text-[13px] leading-tight line-clamp-2">
          {item.name}
        </h3>
        
        <div className="mt-1">
          <p className="text-[9px] sm:text-[11px] text-gray-400 font-bold">
            Tersedia : {item.stok}
          </p>
        </div>

        {/* Tombol Aksi */}
        <div className="mt-auto pt-6 w-full flex justify-center pb-4 sm:pb-6">
          <button
            onClick={() => !isHabis && onAdd(item)}
            disabled={isHabis}
            className={`w-[90%] sm:w-[140px] h-[38px] sm:h-[42px] rounded-lg sm:rounded-[10px] font-bold text-[11px] sm:text-[13px] transition-all flex items-center justify-center gap-2 ${
              isHabis
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#7A1B1B] text-white hover:bg-[#912424] active:bg-[#631414]'
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
  const context = useOrderContext();
  const menuItems = context?.menuItems || [];

  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [showCart, setShowCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(true);

  const noMeja = localStorage.getItem('no_meja') || '12';

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

  const cartMap = cart.reduce((acc, i) => { acc[i.id] = i.qty; return acc; }, {});
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.harga * i.qty, 0);

  const handleAdd = (item) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id);
      return ex
        ? prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...item, qty: 1 }];
    });
  };

  const handleQty = (id, delta) => {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0)
    );
  };

  const submitOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = {
        no_meja: parseInt(noMeja, 10),
        catatan,
        items: cart.map(i => ({ id_menu: i.id, jumlah: i.qty })),
      };
      const res = await orderAPI.create(payload);
      if (res.success) {
        setShowCart(false);
        setShowSuccess(true);
        setCart([]);
        setCatatan('');
        setTimeout(() => {
          setShowSuccess(false);
          navigate(`/tracking/${res.order_id || res.data?.id_pesanan || res.data?.id}`);
        }, 2500);
      } else {
        alert(res.message || 'Gagal membuat pesanan');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsSubmitting(false);
    }
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
        {totalItems > 0 && !showCart && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 pb-6 z-40 pointer-events-none">
            <button
              onClick={() => setShowCart(true)}
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
                Lihat Keranjang
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        )}

        {/* ══ OVERLAY DIM ═════════════════════════════════════════ */}
        {(showCart || showSuccess) && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 animate-in fade-in duration-300"
            onClick={() => !isSubmitting && !showSuccess && setShowCart(false)}
          />
        )}

        {/* ══ CART BOTTOM SHEET ═══════════════════════════════════ */}
        <div
          className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl bg-white rounded-t-[32px] z-[60] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] max-h-[90vh] flex flex-col transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
            showCart ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Sheet Handle */}
          <div className="w-full flex justify-center py-4 shrink-0">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
          </div>

          {/* Inner Content Wrapper (Constrained on Desktop) */}
          <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-black text-gray-900 text-xl tracking-tight">Keranjang Anda</h3>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{totalItems} Item terpilih</p>
              </div>
              <button
                onClick={() => !isSubmitting && setShowCart(false)}
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 active:scale-90 transition-all"
              >
                <X size={22} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-10">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-200">
                  <ShoppingCart size={48} />
                </div>
                <p className="font-black text-gray-800 text-lg">Keranjang masih kosong</p>
                <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">Isi dengan menu favoritmu sebelum melakukan pemesanan.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 no-scrollbar">
                {cart.map(item => (
                  <div key={item.id} className="flex items-start gap-5 group">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100 shadow-sm">
                      {item.image ? (
                        <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          {PLACEHOLDER_ICONS[item.id_kategori] || '🍽️'}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-1">
                      <h4 className="font-black text-base text-gray-800 leading-tight mb-1">{item.name}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-[#7A1B1B] font-black text-base">
                          Rp {(item.harga * item.qty).toLocaleString('id-ID')}
                        </p>
                        <span className="text-gray-300">|</span>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                          @{item.harga.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl shrink-0 mt-1">
                      <button 
                        onClick={() => handleQty(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-400 hover:text-[#7A1B1B] active:scale-90 transition-all border border-gray-100"
                      >
                        <Minus size={14} strokeWidth={4} />
                      </button>
                      <span className="w-6 text-center font-black text-sm text-gray-800">{item.qty}</span>
                      <button 
                        onClick={() => handleQty(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-400 hover:text-[#7A1B1B] active:scale-90 transition-all border border-gray-100"
                      >
                        <Plus size={14} strokeWidth={4} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-gray-50">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3 px-1">Instruksi Tambahan</label>
                  <textarea
                    id="catatan-pesanan"
                    placeholder="Contoh: Sambal dipisah, ya!"
                    value={catatan}
                    onChange={e => setCatatan(e.target.value)}
                    rows={2}
                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] text-sm text-gray-700 placeholder-gray-300 outline-none focus:bg-white focus:ring-4 focus:ring-[#7A1B1B]/5 focus:border-[#7A1B1B]/20 transition-all resize-none font-medium"
                  />
                </div>
              </div>
            )}

            {/* Footer Sheet */}
            {cart.length > 0 && (
              <div className="px-6 pt-6 pb-10 border-t border-gray-50 bg-white shrink-0">
                <div className="bg-gray-50/80 rounded-[32px] p-6 mb-6 flex items-center justify-between border border-gray-100/50">
                  <div>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] block mb-1">Total Pembayaran</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-gray-400">Rp</span>
                      <span className="font-black text-gray-900 text-3xl tracking-tighter">
                        {totalPrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                    <span className="text-[9px] text-[#7A1B1B] font-black uppercase tracking-widest block mb-0.5">Metode Bayar</span>
                    <span className="text-[11px] font-black text-gray-700">Kasir / Tunai</span>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    id="btn-batal"
                    onClick={() => !isSubmitting && setShowCart(false)}
                    disabled={isSubmitting}
                    className="px-8 py-5 rounded-[22px] text-[11px] font-black text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors uppercase tracking-[0.2em]"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-konfirmasi-pesanan"
                    onClick={submitOrder}
                    disabled={isSubmitting}
                    className="flex-1 py-5 rounded-[22px] text-xs font-black text-white bg-[#7A1B1B] hover:bg-[#912424] shadow-2xl shadow-[#7A1B1B]/30 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em]"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 size={20} strokeWidth={3} />
                        Konfirmasi Pesanan
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

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
