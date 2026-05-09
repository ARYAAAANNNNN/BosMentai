import { Minus, Plus } from 'lucide-react';
import { getImageUrl } from '../services/api';

const CartSheet = ({ cart, totalPrice, onClose, onIncrement, onDecrement, onRemove, onClear, onCheckout, isSubmitting, catatan, onCatatanChange }) => {

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
        style={{ animation: 'cartFadeIn 0.2s ease-out' }}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[60]" style={{ animation: 'cartSlideUp 0.35s ease-out' }}>
        <div className="bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col w-full">

          {/* Handle Bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 pt-2 pb-4">
            <h2 className="text-xl font-bold text-gray-900">Keranjang Pesanan</h2>
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
                  const kategori = item.kategori || item.category || 'Dimsum';
                  return (
                    <div key={item.id}>
                      <div className="flex items-center gap-4 py-4">
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
                          <p className="text-base font-bold text-gray-900 leading-tight">
                            Rp {harga.toLocaleString('id-ID')}
                          </p>
                          <p className="text-[13px] font-semibold text-gray-700 mt-0.5 truncate">
                            {item.name || item.nama_menu}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0">
                            {kategori}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-0 shrink-0">
                          <button
                            onClick={() => onDecrement(item.id)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                          >
                            <Minus size={14} strokeWidth={2} />
                          </button>
                          <span className="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-800 border-t border-b border-gray-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onIncrement(item.id)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                          >
                            <Plus size={14} strokeWidth={2} />
                          </button>
                        </div>
                      </div>

                      {/* Divider */}
                      {index < cart.length - 1 && (
                        <div className="h-px bg-gray-100" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-6 pt-5 pb-8 border-t border-gray-200 space-y-4 bg-white">
                {/* Total */}
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Total Pembayaran</p>
                  <p className="text-2xl font-bold text-gray-900">
                    Rp {totalPrice.toLocaleString('id-ID')}
                  </p>
                </div>

                {/* Buttons */}
                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      if (window.confirm('Hapus semua pesanan?')) {
                        onClear();
                        onClose();
                      }
                    }}
                    className="w-full h-12 bg-white border-2 border-red-400 text-red-500 font-semibold text-sm rounded-full hover:bg-red-50 transition-all active:scale-[0.98]"
                  >
                    Hapus Semua
                  </button>

                  <button
                    onClick={onCheckout}
                    disabled={isSubmitting || cart.length === 0}
                    className="w-full h-12 bg-[#4CAF50] hover:bg-[#43A047] text-white font-semibold text-sm rounded-full transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Lanjutkan Pembayaran'
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
        @keyframes cartFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cartSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default CartSheet;
