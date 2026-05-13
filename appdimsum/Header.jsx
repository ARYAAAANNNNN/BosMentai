import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { tableNumber, getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <header className="bg-gradient-to-r from-red-700 to-red-600 text-white sticky top-0 z-50 shadow-lg">
      <div className="w-full px-4 py-3 flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo dan Nama Restoran */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden border-2 border-white">
            <img 
              src="/images/logo-bosmentai.jpg" 
              alt="Bos Mentai Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-black leading-tight tracking-tight">BOS MENTAI</h1>
            <p className="text-[10px] opacity-80 font-bold tracking-widest">SMART ORDER SYSTEM</p>
          </div>
        </div>

        {/* Kanan: Meja & Keranjang */}
        <div className="flex items-center gap-3">
          {/* Nomor Meja */}
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
            <span className="text-sm font-semibold">🍽️ Meja {tableNumber}</span>
          </div>

          {/* Icon Keranjang dengan Badge */}
          <Link 
            to="/confirm" 
            className="relative p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 border border-white/30"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
              />
            </svg>
            {/* Badge Jumlah Item */}
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-red-800 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;