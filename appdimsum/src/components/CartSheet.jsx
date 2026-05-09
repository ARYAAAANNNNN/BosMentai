import { Minus, Plus } from 'lucide-react';
import { getImageUrl } from '../services/api';

const CartSheet = ({ cart, totalPrice, onClose, onIncrement, onDecrement, onClear, onCheckout, isSubmitting }) => {
  if (!cart || cart.length === 0) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-50 transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] animate-in slide-in-from-bottom duration-400 ease-out">
        <div className="bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col w-full">

          {/* Handle Bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 pt-2 pb-4">
            <h2 className="text-xl font-bold text-gray-900">Keranjang Pesanan</h2>
          </div>

          {/* Items List — simple rows with dividers */}
          <div className="flex-1 overflow-y-auto px-6">
            {cart.map((item, index) => {
              const imgSrc = item.image ? getImageUrl(item.image) : null;
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
                        Rp {(item.price || item.harga || 0).toLocaleString('id-ID')}
                      </p>
                      <p className="text-[12px] text-gray-500 truncate mt-0.5">{item.name || item.nama_menu}</p>
                    </div>

                    {/* Quantity Controls — simple inline */}
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => onDecrement(item.id)}
                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        <Minus size={14} strokeWidth={2.5} />
                      </button>
                      <span className="text-sm font-bold text-gray-800 w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onIncrement(item.id)}
                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        <Plus size={14} strokeWidth={2.5} />
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
          <div className="px-6 pt-5 pb-8 border-t border-gray-100 space-y-4 bg-white">
            {/* Total */}
            <div>
              <p className="text-xs text-gray-400 font-medium mb-0.5">Total Pembayaran</p>
              <p className="text-2xl font-bold text-gray-900">
                Rp {totalPrice.toLocaleString('id-ID')}
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  if (window.confirm('Hapus semua pesanan?')) {
                    onClear();
                    onClose();
                  }
                }}
                className="w-full h-12 bg-white border border-red-500 text-red-500 font-semibold text-sm rounded-xl hover:bg-red-50 transition-all active:scale-[0.98]"
              >
                Hapus Semua
              </button>

              <button
                onClick={onCheckout}
                disabled={isSubmitting}
                className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm rounded-xl transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Lanjutkan Pembayaran'
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default CartSheet;
