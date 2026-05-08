import React, { useState } from 'react';
import { ArrowLeft, MapPin, ClipboardList, ChevronRight, Wallet, Info, Edit2 } from 'lucide-react';
import { UseCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { orderAPI, getImageUrl } from '../services/api';

/**
 * CheckoutPage - Desain Modern & Clean (Laptop & Mobile)
 */
const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, tableNumber, getTotalPrice, clearCart } = UseCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map CartContext items to the format expected by CheckoutPage
  const items = cart.map(item => ({
    id: item.id,
    name: item.name || item.nama_menu,
    price: item.price || item.harga,
    qty: item.quantity || item.qty,
    image: item.image || item.gambar,
    notes: item.notes || ""
  }));

  const subtotal = getTotalPrice();
  const serviceFee = 5000;
  const total = subtotal + serviceFee;

  const onConfirm = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = {
        no_meja: parseInt(tableNumber, 10),
        catatan: "", // Bisa ditambah input catatan di UI jika perlu
        items: items.map(i => ({ id_menu: i.id, jumlah: i.qty })),
      };
      const res = await orderAPI.create(payload);
      if (res.success) {
        const orderId = res.order_id || res.data?.id_pesanan || res.data?.id;
        clearCart();
        // Beri jeda sedikit agar user merasa ada proses
        setTimeout(() => {
          navigate(`/monitoring/${orderId}`);
        }, 800);
      } else {
        alert(res.message || 'Gagal membuat pesanan');
      }
    } catch (err) {
      console.error('[CheckoutPage.onConfirm]', err);
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCancel = () => {
    navigate('/menu');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-['Plus_Jakarta_Sans',sans-serif] text-gray-900 pb-32 lg:pb-12">
      {/* Import Font */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');`}
      </style>

      {/* Header - Mobile Only (Simple) */}
      <header className="lg:hidden p-4 mb-2 flex items-center gap-4">
        <button onClick={onCancel} className="p-2 -ml-2 text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-extrabold text-gray-900">Konfirmasi Pesanan</h1>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center gap-4 mb-8">
          <button onClick={onCancel} className="p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900">Konfirmasi Pesanan Anda</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* SISI KIRI: List Pesanan & Lokasi */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card Lokasi */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">Lokasi</p>
                <h2 className="text-2xl font-black text-gray-900">MEJA {tableNumber}</h2>
              </div>
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                <MapPin size={24} />
              </div>
            </div>

            {/* List Pesanan (Desktop Table Style) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="hidden lg:grid grid-cols-5 p-4 border-b border-gray-50 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">
                <div className="col-span-2 text-left">Item</div>
                <div className="">Jumlah</div>
                <div className="">Catatan</div>
                <div className="text-right">Harga</div>
              </div>

              <div className="divide-y divide-gray-50">
                {items.length > 0 ? items.map((item) => (
                  <div key={item.id} className="p-4 lg:p-6 flex flex-col lg:grid lg:grid-cols-5 items-center gap-4 lg:gap-0 group">
                    {/* Item Info (Mobile & Desktop) */}
                    <div className="col-span-2 flex items-center gap-4 w-full">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                        {item.image ? (
                          <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-sm lg:text-base leading-tight">
                          <span className="lg:hidden">{item.qty}x </span>{item.name}
                        </h4>
                        {item.notes && (
                          <p className="text-xs text-gray-400 mt-1 italic font-medium">- Notes: {item.notes}</p>
                        )}
                        <p className="text-sm font-bold text-gray-900 mt-1 lg:hidden">Rp {item.price.toLocaleString('id-ID')}</p>
                      </div>
                      <button onClick={onCancel} className="lg:hidden px-4 py-1.5 border border-red-100 text-[#D04040] text-xs font-bold rounded-lg bg-red-50/30">
                        Ubah
                      </button>
                    </div>

                    {/* Desktop Only Columns */}
                    <div className="hidden lg:block text-center font-bold text-gray-700">{item.qty}x</div>
                    <div className="hidden lg:block text-center text-xs text-gray-500 font-medium">{item.notes || '-'}</div>
                    <div className="hidden lg:block text-right font-bold text-gray-900">Rp {item.price.toLocaleString('id-ID')}</div>
                  </div>
                )) : (
                  <div className="p-12 text-center text-gray-400 font-medium">Belum ada item terpilih</div>
                )}
              </div>
            </div>
          </div>

          {/* SISI KANAN: Ringkasan Pembayaran */}
          <div className="lg:col-span-1 lg:sticky lg:top-8">
            <div className="bg-white p-6 lg:p-8 rounded-[24px] border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Ringkasan Pembayaran</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="text-gray-900 font-bold">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Biaya Layanan</span>
                  <span className="text-gray-900 font-bold">Rp {serviceFee.toLocaleString('id-ID')}</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Total Estimasi:</span>
                  <span className="text-2xl font-black text-[#D04040]">Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Desktop Buttons */}
              <div className="hidden lg:flex flex-col gap-3 pt-4">
                <button 
                  onClick={onConfirm}
                  disabled={isSubmitting || items.length === 0}
                  className="w-full py-4 bg-[#D04040] text-white font-bold text-lg rounded-xl shadow-lg shadow-red-200 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Konfirmasi & Bayar'}
                </button>
                <button 
                  onClick={onCancel}
                  className="w-full py-4 border-2 border-red-100 text-[#D04040] font-bold text-lg rounded-xl hover:bg-red-50 transition-all"
                >
                  Ubah Pesanan
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Fixed Bottom Bar (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white p-4 pb-8 border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50 space-y-3">
        <button 
          onClick={onConfirm}
          disabled={isSubmitting || items.length === 0}
          className="w-full py-4 bg-[#D04040] text-white font-bold text-lg rounded-xl shadow-lg shadow-red-200 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Konfirmasi & Bayar'}
        </button>
        <button 
          onClick={onCancel}
          className="w-full py-4 border border-gray-200 text-gray-500 font-bold text-sm rounded-xl active:scale-95 transition-all"
        >
          Ubah Pesanan
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
