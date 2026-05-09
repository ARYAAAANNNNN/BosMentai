import { useState } from 'react';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { getImageUrl } from '../services/api';

const CartSheet = ({ cart, totalPrice, onClose, onIncrement, onDecrement, onRemove, onClear, onCheckout, isSubmitting, catatan, onCatatanChange }) => {

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[60]" style={{ animation: 'slideUp 0.35s ease-out' }}>
        <div className="bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col w-full">

          {/* Handle Bar + Close */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 pt-2 pb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Keranjang Pesanan</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Empty State */}
          {(!cart || cart.length === 0) ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🛒</span>
              </div>
              <p className="text-gray-500 font-medium text-sm">Keranjang kosong</p>
              <p className="text-gray-400 text-xs mt-1">Silakan pilih menu yang tersedia</p>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6">
                {cart.map((item, index) => {
                  const imgSrc = item.image ? getImageUrl(item.image) : null;
                  const harga = item.price || item.harga || 0;
                  const subtotal = harga * (item.quantity || 1);
                  return (
                    <div key={item.id}>
                      <div className="flex items-center gap-3 py-4">
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          {imgSrc ? (
                            <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🥟</div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-gray-900 leading-tight truncate">
                            {item.name || item.nama_menu}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Rp {harga.toLocaleString('id-ID')} × {item.quantity}
                          </p>
                          <p className="text-[13px] font-bold text-[#D04040] mt-0.5">
                            Rp {subtotal.toLocaleString('id-ID')}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onDecrement(item.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                          >
                            <Minus size={13} strokeWidth={2.5} />
                          </button>
                          <span className="text-sm font-bold text-gray-800 w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => onIncrement(item.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                          >
                            <Plus size={13} strokeWidth={2.5} />
                          </button>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => onRemove(item.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
                        >
                          <Trash2 size={14} strokeWidth={2} />
                        </button>
                      </div>
                      {/* Divider */}
                      {index < cart.length - 1 && (
                        <div className="h-px bg-gray-100" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Catatan */}
              <div className="px-6 pt-3">
                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Catatan (opsional)</label>
                <textarea
                  value={catatan || ''}
                  onChange={(e) => onCatatanChange?.(e.target.value)}
                  placeholder="Contoh: tidak pedas, extra sambal..."
                  rows={2}
                  className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#D04040]/40 focus:bg-white transition-all resize-none placeholder-gray-300"
                />
              </div>

              {/* Footer */}
              <div className="px-6 pt-4 pb-8 space-y-3 bg-white">
                {/* Total */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400 font-medium">Total Pembayaran</p>
                  <p className="text-xl font-bold text-gray-900">
                    Rp {totalPrice.toLocaleString('id-ID')}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Hapus semua pesanan?')) {
                        onClear();
                        onClose();
                      }
                    }}
                    className="flex-shrink-0 h-12 px-5 bg-white border border-gray-200 text-gray-500 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98]"
                  >
                    Hapus Semua
                  </button>

                  <button
                    onClick={onCheckout}
                    disabled={isSubmitting || cart.length === 0}
                    className="flex-1 h-12 bg-[#D04040] hover:bg-[#B83030] text-white font-bold text-sm rounded-xl transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-200"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Konfirmasi Pesanan'
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default CartSheet;
