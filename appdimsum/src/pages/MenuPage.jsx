import { useState, useEffect } from 'react';
import { useOrderContext } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';
import { orderAPI, getImageUrl } from '../services/api';
import { Search, ShoppingCart, X, Minus, Plus, CheckCircle2 } from 'lucide-react';

// ─── MenuCard ────────────────────────────────────
const MenuCard = ({ item, onAdd, isAdded }) => {
  const [imgError, setImgError] = useState(false);
  const isHabis = item.stok === 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
      <div className="relative h-28 sm:h-36 overflow-hidden bg-gray-50">
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
        <h3 className="font-bold text-gray-900 text-[13px] sm:text-sm line-clamp-1 mb-0.5">
          {item.name}
        </h3>
        
        {/* Stok */}
        <p className="text-[10px] sm:text-xs text-gray-500 mb-1">
          Tersedia : {item.stok}
        </p>

        {/* Harga */}
        <p className="text-[#cb3831] font-extrabold text-[13px] sm:text-sm mb-2 mt-auto">
          Rp {(item.harga || 0).toLocaleString('id-ID')}
        </p>
        
        <button
          onClick={() => !isHabis && onAdd(item)}
          disabled={isHabis}
          className={`w-full py-2 rounded-lg font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center justify-center gap-1 ${
            isHabis 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-[#cb3831] text-white hover:bg-[#a92b25] shadow-sm'
          }`}
        >
          {isAdded ? <CheckCircle2 size={14} /> : '+ Pesan'}
        </button>
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

  return (
    <div className="min-h-screen bg-[#f9fafb] pb-24 font-sans relative">
      {/* Flat Header (Matches Reference) */}
      <div className="bg-[#cb3831] px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#cb3831] shadow-sm">
            {/* Logo circle */}
          </div>
          <div>
            <h1 className="text-white text-[15px] sm:text-lg font-black tracking-tight leading-tight">Bos Mentai</h1>
            <p className="text-white/80 text-[10px] font-medium">Ala Carte Modern</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-white rounded-full opacity-80"></div>
            <span className="text-white font-bold text-xs sm:text-sm">Meja {noMeja}</span>
          </div>
          <button onClick={() => setShowCart(true)} className="p-1.5 sm:p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 relative">
            <ShoppingCart size={18} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-900 text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-5 relative z-20">
        
        {/* Categories (Pills with Shadow) */}
        <div className="flex gap-2.5 overflow-x-auto pb-4 scrollbar-hide no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeCategory === cat 
                  ? 'bg-[#cb3831] text-white shadow-md shadow-red-200/50' 
                  : 'bg-white text-gray-800 shadow-sm border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Title & Search Area */}
        <div className="mt-2 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-1">{activeCategory === 'Semua' ? 'Semua Menu' : activeCategory}</h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              {filteredMenu.length} menu tersedia
            </p>
          </div>
          
          <div className="bg-white rounded-full shadow-sm p-1.5 flex items-center border border-gray-100 sm:w-64 w-full">
            <div className="p-2 text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Cari menu favorit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm font-medium text-gray-700 placeholder-gray-400 pr-3"
            />
          </div>
        </div>

        {/* Menu Grid - 2 columns on mobile, 4-5 on larger screens */}
        <div>
          {filteredMenu.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-gray-100">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search size={20} className="text-gray-300" />
              </div>
              <p className="text-gray-400 font-bold text-sm">Menu tidak ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
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
        
        {cart.length === 0 ? (
           <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
             <ShoppingCart size={48} className="text-gray-200 mb-3" />
             <p className="text-gray-400 font-bold">Keranjang Anda kosong</p>
           </div>
        ) : (
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-3 mb-4 bg-gray-50 p-2 rounded-2xl">
                <img src={getImageUrl(item.image)} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <h4 className="font-bold text-xs text-gray-800 line-clamp-1">{item.name}</h4>
                  <p className="text-[#cb3831] font-extrabold text-xs mt-1">Rp {(item.harga || 0).toLocaleString('id-ID')}</p>
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
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#cb3831] resize-none h-20"
              ></textarea>
            </div>
          </div>
        )}

        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-100 shrink-0 bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-sm text-gray-500">Total Pembayaran</span>
              <span className="font-black text-lg text-gray-900">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => !isSubmitting && setShowCart(false)}
                className="flex-1 py-3 text-xs sm:text-sm font-bold text-[#cb3831] border-2 border-[#cb3831] rounded-xl hover:bg-red-50 transition-colors"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                onClick={submitOrder}
                disabled={isSubmitting}
                className="flex-[2] py-3 text-xs sm:text-sm font-bold text-white bg-[#22c55e] rounded-xl hover:bg-green-600 shadow-lg shadow-green-200 transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Memproses...' : 'Buat Pesanan'}
              </button>
            </div>
          </div>
        )}
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
