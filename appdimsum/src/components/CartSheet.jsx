import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
import { getImageUrl } from '../services/api';

const CartSheet = ({ cart, totalPrice, onClose, onIncrement, onDecrement, onCheckout, isSubmitting }) => {
  if (!cart || cart.length === 0) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] animate-in slide-in-from-bottom duration-300">
        <div className="bg-white rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col mx-auto max-w-xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-black text-gray-900 text-lg tracking-tight">Keranjang Pesanan</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-all">
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
            {cart.map(item => {
              const imgSrc = item.image ? getImageUrl(item.image) : null;
              return (
                <div key={item.id} className="flex items-center gap-3 py-2">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    {imgSrc ? (
                      <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🥟</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{item.name || item.nama_menu}</p>
                    <p className="text-xs font-bold text-[#D04040]">
                      Rp {(item.price || item.harga || 0).toLocaleString('id-ID')}
                    </p>
                  </div>

                  {/* Qty Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDecrement(item.id)}
                      className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all active:scale-90"
                    >
                      <Minus size={12} strokeWidth={3} className="text-gray-600" />
                    </button>
                    <span className="text-sm font-black text-gray-800 w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onIncrement(item.id)}
                      className="w-7 h-7 rounded-full bg-[#D04040] flex items-center justify-center hover:bg-[#B03030] transition-all active:scale-90"
                    >
                      <Plus size={12} strokeWidth={3} className="text-white" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-bold">Total Pembayaran</span>
              <span className="text-lg font-black text-gray-900">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
            <button
              onClick={onCheckout}
              disabled={isSubmitting}
              className="w-full h-12 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  Bayar & Kirim
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSheet;
