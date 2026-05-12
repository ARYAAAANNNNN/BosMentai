import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { getImageUrl } from '../services/api';

const CartSheet = ({ cart, totalPrice, onClose, onIncrement, onDecrement, onRemove, onClear, onCheckout, isSubmitting, catatan, onCatatanChange }) => {

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: 'cartFadeIn 0.2s ease-out' }}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[60]" style={{ animation: 'cartSlideUp 0.35s ease-out' }}>
        <div className="bg-white rounded-t-[32px] shadow-2xl max-h-[85vh] flex flex-col w-full overflow-hidden">

          {/* Handle Bar */}
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 py-2 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-gray-900">Pesanan Saya</h2>
              <p className="text-xs text-gray-400">Pastikan pesanan Anda sudah sesuai</p>
            </div>
            {cart && cart.length > 0 && (
              <button 
                onClick={() => {
                  if (window.confirm('Kosongkan keranjang?')) {
                    onClear();
                    onClose();
                  }
                }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>

          {/* Body Content */}
          {(!cart || cart.length === 0) ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 px-6">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-4xl">
                🛒
              </div>
              <p className="text-gray-500 font-bold">Keranjang Kosong</p>
              <p className="text-gray-400 text-xs mt-1 text-center">
                Belum ada menu yang dipilih.<br/>Yuk, pilih menu favoritmu!
              </p>
              <button 
                onClick={onClose}
                className="mt-6 px-8 py-2 bg-gray-900 text-white rounded-full text-sm font-bold active:scale-95 transition-transform"
              >
                Lihat Menu
              </button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {cart.map((item) => {
                  const imgSrc = item.image ? getImageUrl(item.image) : null;
                  const harga = item.price || item.harga || 0;
                  
                  // LOGIKA STOK: Cek apakah jumlah di keranjang sudah maksimal
                  const stokMurni = Number(item.stok || 0);
                  const isMaxStok = item.quantity >= stokMurni;

                  return (
                    <div key={item.id} className="flex items-center gap-4 group">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-50">
                        {imgSrc ? (
                          <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🥟</div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {item.name || item.nama_menu}
                        </p>
                        <p className="text-[#D04040] font-black text-sm mt-0.5">
                          Rp {(harga * item.quantity).toLocaleString('id-ID')}
                        </p>
                        {/* Label Stok sisa jika stok menipis */}
                        <p className="text-[9px] font-bold text-gray-400">
                          Sisa: {stokMurni}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                        <button
                          onClick={() => onDecrement(item.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-white hover:shadow-sm active:scale-90 transition-all"
                        >
                          <Minus size={14} strokeWidth={3} />
                        </button>
                        
                        <span className="w-8 text-center text-sm font-black text-gray-800">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => {
                            if (isMaxStok) {
                              alert(`Stok tidak mencukupi (Maks. ${stokMurni})`);
                              return;
                            }
                            onIncrement(item.id);
                          }}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all active:scale-90
                            ${isMaxStok 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-gray-600 hover:bg-white hover:shadow-sm'
                            }`}
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Section */}
              <div className="px-6 pt-6 pb-10 border-t border-gray-100 bg-white space-y-4">
                {/* Total Info */}
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Estimasi Total</p>
                    <p className="text-2xl font-black text-gray-900">
                      Rp {totalPrice.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Item</p>
                    <p className="text-sm font-black text-gray-700">{cart.length} Menu</p>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={onCheckout}
                  disabled={isSubmitting || cart.length === 0}
                  className={`w-full h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.97] shadow-lg shadow-green-100
                    ${isSubmitting 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-[#4CAF50] text-white hover:bg-[#43A047]'
                    }`}
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-3 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Pesan Sekarang
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Animations CSS */}
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