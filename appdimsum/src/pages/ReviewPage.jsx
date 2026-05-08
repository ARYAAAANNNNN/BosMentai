import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { ChevronLeft, CreditCard, Wallet, QrCode, AlertCircle, CheckCircle2 } from 'lucide-react';

const ReviewPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('pending_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      navigate('/menu');
    }
  }, [navigate]);

  const totalPrice = cart.reduce((s, i) => s + (i.harga * i.qty), 0);
  const tax = totalPrice * 0.1;
  const grandTotal = totalPrice + tax;
  const noMeja = localStorage.getItem('no_meja') || '12';

  const handleConfirmOrder = async () => {
    setLoading(true);
    try {
      const response = await orderAPI.create({
        no_meja: parseInt(noMeja),
        catatan: '',
        items: cart.map(i => ({ id_menu: i.id, jumlah: i.qty }))
      });
      
      if (response.success) {
        setOrderId(response.id_pesanan);
        setShowQR(true);
        // Clear pending cart
        localStorage.removeItem('pending_cart');
      } else {
        alert(response.message || 'Gagal membuat pesanan.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSimulated = () => {
    // Simulate payment success and redirect to tracker
    setTimeout(() => {
        navigate(`/tracking/${orderId}`);
    }, 2000);
  };

  if (showQR) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
            <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl p-8 text-center border border-gray-100">
                <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                        <CheckCircle2 size={40} />
                    </div>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Pesanan Dibuat!</h2>
                <p className="text-sm text-gray-400 mb-8 font-medium">Silakan scan QRIS di bawah untuk menyelesaikan pembayaran</p>
                
                <div className="bg-gray-50 p-6 rounded-[32px] mb-8 relative group overflow-hidden border-2 border-dashed border-gray-200">
                    <div className="relative z-10">
                        <img 
                            src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" 
                            alt="QRIS" 
                            className="w-full h-auto rounded-xl shadow-sm"
                        />
                    </div>
                    <div className="absolute inset-0 bg-[#D04040]/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <QrCode className="text-[#D04040] opacity-20" size={100} />
                    </div>
                </div>

                <div className="flex flex-col mb-8">
                    <span className="text-xs font-bold text-[#D04040] uppercase tracking-wider">Total Bayar</span>
                    <span className="text-lg font-black text-[#D04040]">Rp {grandTotal.toLocaleString('id-ID')}</span>
                </div>

                <button 
                    onClick={handlePaymentSimulated}
                    className="w-full bg-[#D04040] text-white py-4 rounded-2xl font-black shadow-xl shadow-red-200 active:scale-95 transition-all"
                >
                    SAYA SUDAH BAYAR
                </button>
                <p className="mt-4 text-[10px] text-gray-400 font-medium italic">Otomatis dialihkan setelah pembayaran terdeteksi</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-6 flex items-center gap-4 sticky top-0 z-30">
        <button onClick={() => navigate('/menu')} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-black text-gray-900">Review Pesanan</h1>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Table Info */}
        <div className="bg-[#D04040] p-6 rounded-[32px] shadow-lg shadow-red-200 flex justify-between items-center text-white relative overflow-hidden">
            <div className="relative z-10">
                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">Nomor Meja</p>
                <h3 className="text-2xl font-black italic">Meja {noMeja}</h3>
            </div>
            <div className="relative z-10 bg-white/20 p-3 rounded-2xl border border-white/30 backdrop-blur-sm">
                <CreditCard size={28} />
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        </div>

        {/* Item List */}
        <div className="space-y-3">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest ml-1 mb-2">Item Pesanan</h2>
          {cart.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-200">
                    <Wallet size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-800 mb-1">{item.name}</h4>
                <p className="text-xs text-gray-400 font-medium italic">Rp {item.harga.toLocaleString('id-ID')} x {item.qty}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-gray-900">Rp {(item.harga * item.qty).toLocaleString('id-ID')}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Note Box */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={16} className="text-orange-400" />
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Catatan Pesanan</h3>
            </div>
            <textarea 
                placeholder="Tulis catatan (misal: jangan pedas, perbanyak saus)..."
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#D04040]/10 min-h-[100px] resize-none"
            ></textarea>
        </div>

        {/* Billing Summary */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6 text-center">Rincian Pembayaran</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400 font-medium">Subtotal</span>
                    <span className="text-sm text-gray-800 font-bold">Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400 font-medium">Pajak (10%)</span>
                    <span className="text-sm text-gray-800 font-bold">Rp {tax.toLocaleString('id-ID')}</span>
                </div>
                <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                    <span className="text-base text-gray-900 font-black">Total Akhir</span>
                    <span className="text-xl text-[#D04040] font-black italic">Rp {grandTotal.toLocaleString('id-ID')}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-50 to-transparent">
        <button
          onClick={handleConfirmOrder}
          disabled={loading}
          className={`max-w-2xl mx-auto w-full bg-[#D04040] text-white py-5 rounded-[28px] font-black shadow-2xl shadow-red-200 active:scale-95 transition-all flex items-center justify-center gap-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? 'MEMPROSES...' : 'PESAN & BAYAR SEKARANG'}
        </button>
      </div>
    </div>
  );
};

export default ReviewPage;
