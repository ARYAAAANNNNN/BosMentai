import React, { useState } from 'react';
import { ArrowLeft, QrCode, CreditCard, Banknote, CheckCircle2, ChevronRight } from 'lucide-react';

/**
 * PaymentPage
 * @param {Object} props
 * @param {Number} props.totalAmount - Total yang harus dibayar
 * @param {Function} props.onPaymentConfirm - Callback saat pembayaran dikonfirmasi
 * @param {Function} props.onCancel - Callback saat batal
 */
const PaymentPage = ({ 
  totalAmount = 0, 
  onPaymentConfirm, 
  onCancel 
}) => {
  const [method, setMethod] = useState('qris'); // 'qris' or 'cash'

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-4">
        <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-lg font-bold">Pilih Pembayaran</h1>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4">
        {/* Total Card */}
        <div className="bg-gray-50 rounded-[32px] p-8 text-center mt-4 mb-8">
          <p className="text-sm text-gray-500 font-medium mb-1">Total Pembayaran</p>
          <h2 className="text-4xl font-black text-[#D04040]">
            Rp {totalAmount.toLocaleString('id-ID')}
          </h2>
        </div>

        <h3 className="text-base font-bold mb-4">Metode Pembayaran</h3>

        <div className="space-y-3">
          {/* QRIS Option */}
          <button 
            onClick={() => setMethod('qris')}
            className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
              method === 'qris' 
                ? 'border-[#D04040] bg-[#D04040]/5' 
                : 'border-gray-100 bg-white'
            }`}
          >
            <div className={`p-3 rounded-xl ${method === 'qris' ? 'bg-[#D04040] text-white' : 'bg-gray-100 text-gray-400'}`}>
              <QrCode size={24} />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-bold text-sm">QRIS</h4>
              <p className="text-xs text-gray-500">OVO, GoPay, Dana, ShopeePay</p>
            </div>
            {method === 'qris' && <CheckCircle2 size={20} className="text-[#D04040]" />}
          </button>

          {/* Cash Option */}
          <button 
            onClick={() => setMethod('cash')}
            className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
              method === 'cash' 
                ? 'border-[#D04040] bg-[#D04040]/5' 
                : 'border-gray-100 bg-white'
            }`}
          >
            <div className={`p-3 rounded-xl ${method === 'cash' ? 'bg-[#D04040] text-white' : 'bg-gray-100 text-gray-400'}`}>
              <Banknote size={24} />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-bold text-sm">Bayar di Kasir</h4>
              <p className="text-xs text-gray-500">Tunjukkan ID Pesanan ke kasir</p>
            </div>
            {method === 'cash' && <CheckCircle2 size={20} className="text-[#D04040]" />}
          </button>
        </div>

        {/* Payment Detail (Conditional) */}
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {method === 'qris' ? (
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 bg-white border-4 border-gray-100 rounded-3xl p-4 flex items-center justify-center shadow-inner">
                {/* QR Code Placeholder */}
                <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center relative overflow-hidden group">
                  <QrCode size={80} className="text-gray-300 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-[#D04040]/5 flex items-center justify-center">
                    <p className="text-[10px] font-bold text-[#D04040] bg-white px-2 py-1 rounded-full shadow-sm">PLACEHOLDER QR</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center px-8">
                Scan kode QR di atas menggunakan aplikasi e-wallet pilihan Anda untuk membayar.
              </p>
            </div>
          ) : (
            <div className="bg-[#D04040]/5 p-5 rounded-2xl border border-[#D04040]/10">
              <h5 className="text-[#D04040] font-bold text-sm mb-2">Instruksi Pembayaran</h5>
              <ol className="text-xs text-gray-600 space-y-2 list-decimal ml-4">
                <li>Selesaikan pesanan Anda terlebih dahulu.</li>
                <li>Simpan Nomor Pesanan Anda.</li>
                <li>Datang ke kasir sebelum meninggalkan lokasi.</li>
                <li>Lakukan pembayaran tunai atau debit di kasir.</li>
              </ol>
            </div>
          )}
        </div>
      </main>

      {/* Footer Actions */}
      <footer className="p-4 flex flex-col gap-3">
        <button 
          onClick={() => onPaymentConfirm(method)}
          className="w-full py-4 bg-[#D04040] text-white font-bold rounded-2xl shadow-xl shadow-[#D04040]/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          Konfirmasi Pembayaran
          <ChevronRight size={18} />
        </button>
        <button 
          onClick={onCancel}
          className="w-full py-3 text-gray-400 font-bold rounded-2xl active:scale-95 transition-transform"
        >
          Batalkan
        </button>
      </footer>
    </div>
  );
};

export default PaymentPage;
