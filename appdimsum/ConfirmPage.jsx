import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const ConfirmPage = () => {
  const navigate = useNavigate();
  const { cart, tableNumber, clearCart, sendToKitchen, getTotalItems } = useCart();
  const totalItems = getTotalItems();

  const handleConfirm = () => {
    if (cart.length === 0) {
      alert('Keranjang kosong! Silakan pilih menu terlebih dahulu.');
      return;
    }
    
    // Kirim pesanan ke dapur via localStorage
    sendToKitchen(cart);
    
    alert(`Pesanan Meja ${tableNumber} dikirim ke dapur!`);
    clearCart();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-[#D04040] text-white shadow-xl sticky top-0 z-50">
        <div className="w-full max-w-2xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-extrabold tracking-tight">Konfirmasi</h1>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs font-bold uppercase tracking-wider">
              Meja {tableNumber}
            </div>
          </div>
        </div>
      </header>

      {/* Info Sesi */}
      <div className="bg-white border-b border-gray-100 mb-6">
        <div className="w-full max-w-2xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
               <span className="material-icons">restaurant</span>
            </div>
            <div>
              <p className="font-extrabold text-gray-900 text-lg">Menu Pilihan Anda</p>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Bos Mentai Premium</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-[#D04040]">{totalItems}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Item</p>
          </div>
        </div>
      </div>

      {/* Daftar Item */}
      <main className="w-full max-w-2xl mx-auto px-6 pb-40">
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Item di Keranjang</h2>
        </div>
        
        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
            <div className="text-5xl mb-4">🍽️</div>
            <p className="text-gray-900 font-bold text-lg mb-1">Wah, keranjang kosong!</p>
            <p className="text-gray-400 text-sm mb-8">Pilih menu lezat kami dulu yuk</p>
            <button
              onClick={() => navigate('/')}
              className="bg-[#D04040] hover:bg-[#b83838] text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-lg shadow-red-100"
            >
              Cari Menu
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-3xl border border-gray-50 shadow-sm hover:shadow-md transition-all">
                <CartItem item={item} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Tombol Konfirmasi - Fixed Bottom */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-6 z-50">
          <div className="w-full max-w-2xl mx-auto">
            <button
              onClick={handleConfirm}
              className="w-full bg-[#D04040] hover:bg-[#b83838] text-white font-black py-5 px-6 rounded-3xl transition-all duration-300 text-lg flex items-center justify-center gap-3 shadow-xl shadow-red-200 active:scale-[0.98]"
            >
              <span className="material-icons">send</span>
              KIRIM KE DAPUR
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full mt-3 text-gray-400 hover:text-gray-600 text-xs font-bold uppercase tracking-widest"
            >
              ← Tambah Pesanan Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmPage;
