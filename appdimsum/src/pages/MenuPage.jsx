import { useState, useEffect } from 'react';
import { useOrderContext } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';
import { orderAPI, getImageUrl } from '../services/api';
import { Search, ShoppingCart, ChevronRight, X, Minus, Plus, CheckCircle2, User, LogOut } from 'lucide-react';

// ─── MenuCard ────────────────────────────────────
const MenuCard = ({ item, onAdd, isAdded }) => {
  const [imgError, setImgError] = useState(false);
  const isHabis = item.stok === 0;

  return (
    <div
      className="bg-white rounded-3xl border border-gray-100 overflow-hidden flex flex-col relative"
      style={{
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        opacity: isHabis ? 0.7 : 1,
      }}
    >
      <div className="relative h-32 overflow-hidden bg-gray-50">
        {item.image && !imgError ? (
          <img
            src={getImageUrl(item.image)}
            alt={item.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-200">
            <ShoppingCart size={32} />
          </div>
        )}

        {isHabis && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-white text-red-600 font-bold text-[10px] px-3 py-1.5 rounded-full shadow-lg">
              HABIS
            </span>
          </div>
        )}

        {isAdded && !isHabis && (
          <div className="absolute inset-0 bg-[#22c55e]/80 flex flex-col items-center justify-center text-white backdrop-blur-[1px] animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center mb-1">
                <CheckCircle2 size={16} />
            </div>
            <span className="font-bold text-[10px]">DITAMBAHKAN</span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-xs mb-1 line-clamp-2 min-h-[32px]">
          {item.name}
        </h3>
        
        <div className="mt-auto pt-2 flex items-center justify-between">
          <p className="text-[#C0392B] font-extrabold text-xs">
            Rp {(item.harga || 0).toLocaleString('id-ID')}
          </p>
          <button
            onClick={() => !isHabis && onAdd(item)}
            disabled={isHabis}
            className={`p-1.5 rounded-lg transition-all active:scale-90 ${
              isHabis 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-red-50 text-[#C0392B] hover:bg-[#C0392B] hover:text-white'
            }`}
          >
            <Plus size={16} />
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
  
  // Modals state
  const [showCart, setShowCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [catatan, setCatatan] = useState('');

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
      id: item.id || item.id_menu,
      name: item.nama || item.nama_menu,
      image: item.image || item.gambar,
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
    setTimeout(() => setAddedItems(prev => ({ ...prev, [item.id]: false })), 800);
  };

  const handleQty = (id, delta) => {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
          .filter(i => i.qty > 0)
    );
  };

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + (i.harga * i.qty), 0);

  const submitOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = {
        no_meja: parseInt(noMeja, 10),
        catatan: catatan,
        items: cart.map(i => ({
          id_menu: i.id,
          jumlah: i.qty
        }))
      };

      const res = await orderAPI.create(payload);
      if (res.success) {
        setShowCart(false);
        setShowSuccess(true);
        setCart([]);
        setCatatan('');
        
        // Auto close success modal & redirect to tracking
        setTimeout(() => {
          setShowSuccess(false);
          navigate(`/tracking/${res.order_id || res.data?.id_pesanan || res.data?.id}`);
        }, 2500);
      } else {
        alert(res.message || 'Gagal membuat pesanan');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('no_meja');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans relative">
      {/* Flat Red Header */}
      <div className="bg-[#C0392B] px-4 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#C0392B]">
            <User size={20} />
          </div>
          <div>
            <h1 className="text-white text-lg font-black tracking-tight leading-tight">Bos Mentai</h1>
            <p className="text-white/80 text-[10px] font-medium">Ala Carte Modern</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white/20 border border-white/30 px-3 py-1.5 rounded-xl flex items-center">
            <span className="text-white font-bold text-xs">Meja {noMeja}</span>
          </div>
          <button onClick={handleLogout} className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 relative z-20">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide no-scrollbar -mx-4 px-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                activeCategory === cat 
                  ? 'bg-[#C0392B] text-white border-[#C0392B] shadow-md' 
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-1.5 flex items-center mb-5 border border-gray-100">
          <div className="p-2 text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Cari menu favoritmu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-xs font-medium text-gray-700 placeholder-gray-400 pr-3"
          />
        </div>

        {/* Menu Grid */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-extrabold text-gray-900">Semua Menu</h2>
            <span className="text-[10px] text-gray-400 font-medium">
              {filteredMenu.length} menu ditemukan
            </span>
          </div>

          {filteredMenu.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-gray-100">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search size={20} className="text-gray-300" />
              </div>
              <p className="text-gray-400 font-bold text-xs">Menu tidak ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
      {totalItems > 0 && !showCart && !showSuccess && (
        <div className="fixed bottom-4 left-0 right-0 px-4 z-40 animate-in slide-in-from-bottom duration-300">
          <button
            onClick={() => setShowCart(true)}
            className="max-w-2xl mx-auto w-full bg-[#C0392B] text-white p-4 rounded-2xl shadow-xl shadow-red-200 flex items-center justify-between active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl relative">
                <ShoppingCart size={18} />
                <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-red-900 text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[9px] font-bold opacity-80 uppercase">Keranjang</p>
                <p className="font-bold text-sm">Rp {totalPrice.toLocaleString('id-ID')}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 font-bold text-xs bg-white text-[#C0392B] px-3 py-1.5 rounded-lg">
              Cek Pesanan
            </div>
          </button>
        </div>
      )}

      {/* OVERLAYS & MODALS */}

      {/* Background Dimmer */}
      {(showCart || showSuccess) && (
        <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={() => !isSubmitting && !showSuccess && setShowCart(false)}></div>
      )}

      {/* Cart Bottom Sheet */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 transition-transform duration-300 shadow-2xl max-h-[85vh] flex flex-col ${showCart ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 className="font-extrabold text-gray-900 text-lg">Keranjang Pesanan</h3>
          <button onClick={() => !isSubmitting && setShowCart(false)} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-3 mb-4 bg-gray-50 p-2 rounded-2xl">
              <img src={getImageUrl(item.image)} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-1">
                <h4 className="font-bold text-xs text-gray-800 line-clamp-1">{item.name}</h4>
                <p className="text-[#C0392B] font-extrabold text-xs mt-1">Rp {(item.harga || 0).toLocaleString('id-ID')}</p>
              </div>
              <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100">
                <button onClick={() => handleQty(item.id, -1)} className="p-2 text-gray-500 active:bg-gray-100 rounded-l-xl">
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center font-bold text-xs">{item.qty}</span>
                <button onClick={() => handleQty(item.id, 1)} className="p-2 text-gray-500 active:bg-gray-100 rounded-r-xl">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}

          <div className="mt-4">
            <textarea
              placeholder="Catatan pesanan (opsional)..."
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#C0392B] resize-none h-20"
            ></textarea>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 shrink-0 bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-sm text-gray-500">Total Pembayaran</span>
            <span className="font-black text-lg text-gray-900">Rp {totalPrice.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => !isSubmitting && setShowCart(false)}
              className="flex-1 py-3 text-xs font-bold text-[#C0392B] border-2 border-[#C0392B] rounded-xl hover:bg-red-50"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              onClick={submitOrder}
              disabled={isSubmitting}
              className="flex-[2] py-3 text-xs font-bold text-white bg-[#22c55e] rounded-xl hover:bg-green-600 shadow-lg shadow-green-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Memproses...' : 'Buat Pesanan'}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-[280px] w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-[#22c55e]" />
            </div>
            <h3 className="font-black text-gray-900 text-lg mb-1">Pesanan Berhasil!</h3>
            <p className="text-xs text-gray-500 mb-4">Dapur kami sedang menyiapkan pesanan Anda.</p>
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#22c55e] animate-[progress_2.5s_ease-in-out_1]"></div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MenuPage;
