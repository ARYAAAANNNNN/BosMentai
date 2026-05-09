import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
import { getImageUrl } from '../services/api';

const CartSheet = ({ cart, totalPrice, onClose, onIncrement, onDecrement, onClear, onCheckout, isSubmitting }) => {
  if (!cart || cart.length === 0) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 transition-opacity animate-in fade-in duration-300" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] animate-in slide-in-from-bottom duration-500 ease-out">
        <div className="bg-gray-50 rounded-t-[40px] shadow-2xl max-h-[92vh] flex flex-col w-full border-t border-white/20">
          
          {/* Handle Bar */}
          <div className="w-full flex justify-center pt-3 pb-1">
            <div className="w-16 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex justify-center w-full pt-12 pb-6">
            <div className="w-full max-w-5xl px-6 md:px-20 flex items-center justify-between">
              <h2 className="font-black text-gray-900 text-2xl tracking-tight">Keranjang Pesanan</h2>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-all active:scale-90">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto py-2">
            <div className="flex justify-center w-full">
              <div className="w-full max-w-5xl px-4 md:px-16 space-y-4">
                {cart.map(item => {
                  const imgSrc = item.image ? getImageUrl(item.image) : null;
                  return (
                    <div key={item.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-md">
                      {/* Thumbnail */}
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                        {imgSrc ? (
                          <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">🥟</div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xl font-black text-gray-900 leading-tight mb-1">
                          Rp {(item.price || item.harga || 0).toLocaleString('id-ID')}
                        </p>
                        <p className="text-sm font-bold text-gray-500 truncate">{item.name || item.nama_menu}</p>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Dimsum</p>
                      </div>

                      {/* Qty Controls */}
                      <div className="flex items-center bg-gray-50 p-1 rounded-2xl border border-gray-100">
                        <button
                          onClick={() => onDecrement(item.id)}
                          className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 transition-all active:scale-90"
                        >
                          <Minus size={14} strokeWidth={3} className="text-gray-400" />
                        </button>
                        <span className="text-md font-black text-gray-800 w-10 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onIncrement(item.id)}
                          className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 transition-all active:scale-90"
                        >
                          <Plus size={14} strokeWidth={3} className="text-gray-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white rounded-t-[40px] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] pt-6 pb-10">
            <div className="flex justify-center w-full">
              <div className="w-full max-w-5xl px-6 md:px-20 space-y-6">
                <div className="space-y-1">
                  <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">Total Pembayaran</span>
                  <p className="text-2xl font-medium text-gray-900">
                    Rp {totalPrice.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => {
                      if(window.confirm('Hapus semua pesanan?')) {
                        onClear();
                        onClose();
                      }
                    }}
                    className="w-full h-10 bg-white border-2 border-red-500 text-red-500 font-black text-[11px] rounded-xl hover:bg-red-50 transition-all flex items-center justify-center active:scale-[0.98]"
                  >
                    Hapus Semua
                  </button>
                  
                  <button
                    onClick={onCheckout}
                    disabled={isSubmitting}
                    className="w-full h-10 bg-[#4ADE80] hover:bg-green-500 active:bg-green-600 text-white font-black text-[11px] rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Lanjutkan Pembayaran"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSheet;
