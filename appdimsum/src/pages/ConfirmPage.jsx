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
      <header className="bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg">
        <div className="w-full max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="p-2 hover:bg-white/20 rounded-lg transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold">📋 Konfirmasi Pesanan</h1>
            </div>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30 font-semibold">
              🍽️ Meja {tableNumber}
            </span>
          </div>
        </div>
      </header>

      {/* Info Sesi */}
      <div className="bg-white shadow-md mb-4">
        <div className="w-full max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-semibold text-gray-800">Paket: All You Can Eat</p>
                <p className="text-xs text-gray-500">Gratis tidak perlu bayar</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-600">{totalItems}</p>
              <p className="text-xs text-gray-500">total item</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daftar Item */}
      <main className="w-full max-w-7xl mx-auto px-4 pb-40">
        <h2 className="text-lg font-bold text-gray-800 mb-4">📝 Daftar Pesanan</h2>
        
        {cart.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500 text-lg mb-2">Keranjang kosong</p>
            <p className="text-gray-400 text-sm mb-6">Silakan pilih menu terlebih dahulu</p>
            <button
              onClick={() => navigate('/')}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition"
            >
              ← Pilih Menu
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      {/* Tombol Konfirmasi - Fixed Bottom */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 p-4">
          <div className="w-full max-w-7xl mx-auto">
            <button
              onClick={handleConfirm}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              KONFIRMASI PESANAN
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full mt-2 text-gray-500 hover:text-gray-700 text-sm font-medium py-2"
            >
              ← Tambah Menu Lain
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmPage;
