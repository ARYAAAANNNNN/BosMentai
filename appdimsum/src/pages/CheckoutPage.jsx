import React from 'react';
import { ArrowLeft, MapPin, ClipboardList, ChevronRight, Wallet, Info } from 'lucide-react';

/**
 * CheckoutPage
 * @param {Object} props
 * @param {Array} props.items - Daftar item pesanan [{ id, name, price, qty, image }]
 * @param {Number} props.tableNumber - Nomor meja aktif
 * @param {Function} props.onConfirm - Callback saat tombol konfirmasi diklik
 * @param {Function} props.onCancel - Callback saat tombol batal diklik
 */
const CheckoutPage = ({ 
  items = [], 
  tableNumber = 0, 
  onConfirm, 
  onCancel 
}) => {
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const serviceFee = 2000;
  const total = subtotal + serviceFee;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-100 z-50 px-4 py-4 flex items-center gap-4">
        <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-lg font-bold">Konfirmasi Pesanan</h1>
      </header>

      <main className="max-w-md mx-auto">
        {/* Info Meja */}
        <div className="bg-white p-4 mb-2 flex items-start gap-4">
          <div className="bg-[#7A1B1B]/10 p-2 rounded-lg">
            <MapPin size={24} className="text-[#7A1B1B]" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500 font-medium">Lokasi Pesanan</p>
            <h2 className="text-base font-bold">Meja Nomor {tableNumber || '—'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Bos Mentai - QR SmartOrder</p>
          </div>
          <button className="text-[#7A1B1B] text-sm font-bold">Ubah</button>
        </div>

        {/* Ringkasan Pesanan */}
        <div className="bg-white p-4 mb-2">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList size={20} className="text-gray-400" />
            <h3 className="font-bold">Ringkasan Pesanan</h3>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ClipboardList size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="text-sm font-bold leading-tight">{item.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{item.qty}x • Rp {item.price.toLocaleString('id-ID')}</p>
                </div>
                <div className="flex items-center">
                  <p className="text-sm font-bold">Rp {(item.price * item.qty).toLocaleString('id-ID')}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-2 text-[#7A1B1B] text-sm font-bold border border-[#7A1B1B]/20 rounded-xl hover:bg-[#7A1B1B]/5 transition-colors">
            Tambah Item Lagi
          </button>
        </div>

        {/* Rincian Pembayaran */}
        <div className="bg-white p-4">
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={20} className="text-gray-400" />
            <h3 className="font-bold">Rincian Pembayaran</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-700">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 flex items-center gap-1">
                Biaya Layanan <Info size={14} className="text-gray-300" />
              </span>
              <span className="font-medium text-gray-700">Rp {serviceFee.toLocaleString('id-ID')}</span>
            </div>
            <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
              <span className="text-base font-bold">Total Estimasi</span>
              <span className="text-lg font-black text-[#7A1B1B]">Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Note */}
        <p className="p-4 text-[11px] text-gray-400 text-center italic">
          *Harga di atas sudah termasuk pajak PPN.
        </p>
      </main>

      {/* Bottom Action */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50 flex gap-3">
        <button 
          onClick={onCancel}
          className="flex-1 py-3 border border-[#7A1B1B] text-[#7A1B1B] font-bold rounded-2xl active:scale-95 transition-transform"
        >
          Batal
        </button>
        <button 
          onClick={() => onConfirm({ items, total, tableNumber })}
          className="flex-[2] py-3 bg-[#7A1B1B] text-white font-bold rounded-2xl shadow-lg shadow-[#7A1B1B]/30 active:scale-95 transition-transform"
        >
          Konfirmasi Pesanan
        </button>
      </footer>
    </div>
  );
};

export default CheckoutPage;
